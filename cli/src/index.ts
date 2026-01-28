#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import fs from 'fs-extra';
import axios from 'axios';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import ffmpeg from 'ffmpeg-static';
import { spawn } from 'child_process';

const program = new Command();

program
  .name('tsx-studio')
  .description('Local rendering CLI for TSX Studio')
  .version('1.0.0');

// Configuration
const CONFIG_FILE = path.join(process.cwd(), '.tsx-studio-config.json');

program
  .command('auth')
  .description('Set your authentication secret')
  .argument('<secret>', 'Your TSX Studio API secret')
  .action(async (secret) => {
    await fs.writeJson(CONFIG_FILE, { secret });
    console.log(chalk.green('✔ Authentication secret saved locally.'));
  });

program
  .command('render')
  .description('Render a project locally')
  .argument('<projectId>', 'The ID of the project to render')
  .option('-o, --output <path>', 'Output path', 'output.mp4')
  .action(async (projectId, options) => {
    const spinner = ora('Initializing render engine...').start();

    try {
      const config = await fs.readJson(CONFIG_FILE).catch(() => ({}));
      if (!config.secret) {
        spinner.fail(chalk.red('Authentication required. Run: tsx-studio auth <secret>'));
        return;
      }

      spinner.text = 'Fetching project bundle from cloud...';
      const baseUrl = process.env.TSX_STUDIO_URL || 'https://tsx-studio.vercel.app';
      const response = await axios.get(`${baseUrl}/api/bundle/${projectId}`, {
        headers: { 'Authorization': `Bearer ${config.secret}` }
      });

      const { code, composition } = response.data;
      const { width, height, fps, durationInFrames } = composition;

      const tempDir = path.join(process.cwd(), '.tsx-temp', projectId);
      await fs.ensureDir(tempDir);

      const inputPath = path.join(tempDir, 'UserComposition.tsx');
      const entryPath = path.join(tempDir, 'index.tsx');
      const cssPath = path.join(tempDir, 'styles.css');

      await fs.writeFile(inputPath, code);

      // Wrapper logic for Remotion
      const entryContent = `
        import React from 'react';
        import { registerRoot, Composition } from 'remotion';
        import './styles.css';
        import UserComp from './UserComposition';

        export const RemotionRoot: React.FC = () => {
            return (
                <Composition
                    id="Main"
                    component={UserComp}
                    durationInFrames={${durationInFrames}}
                    fps={${fps}}
                    width={${width}}
                    height={${height}}
                />
            );
        };
        registerRoot(RemotionRoot);
      `;
      await fs.writeFile(entryPath, entryContent);
      await fs.writeFile(cssPath, `/* Tailwind placeholder */`);

      spinner.text = 'Bundling project code...';
      const bundled = await bundle({
        entryPoint: entryPath,
        outDir: path.join(tempDir, 'bundle'),
      });

      const comp = await selectComposition({
        serveUrl: bundled,
        id: 'Main',
      });

      spinner.text = 'Rendering video (Local GPU/CPU)...';
      await renderMedia({
        composition: comp,
        serveUrl: bundled,
        codec: 'h264',
        outputLocation: path.resolve(options.output),
        ffmpegExecutable: ffmpeg as string,
        onProgress: ({ progress }) => {
          spinner.text = `Rendering frames: ${Math.floor(progress * 100)}%`;
        },
      });

      spinner.succeed(chalk.green(`✔ Render complete: ${options.output}`));
      await fs.remove(path.join(process.cwd(), '.tsx-temp'));

    } catch (err: any) {
      spinner.fail(chalk.red(`✘ Render failed: ${err.message}`));
      if (err.response?.data?.error) console.error(chalk.yellow(err.response.data.error));
    }
  });

program
  .command('transcribe')
  .description('Transcribe a local audio/video file (Whisper)')
  .argument('<filePath>', 'Path to media file')
  .option('-m, --model <model>', 'Whisper model', 'base')
  .action(async (filePath, options) => {
    const spinner = ora('Initializing transcription engine...').start();
    const outputPath = path.join(path.dirname(filePath), 'transcript.json');

    try {
      spinner.text = 'Running Whisper (Local System)...';

      // Attempt to spawn local whisper binary
      // Assumes 'whisper' or 'main' (whisper.cpp) is in PATH
      // Arguments adjusted for a generic whisper.cpp interface
      const whisperProcess = spawn('whisper', [
        filePath,
        '--model', options.model,
        '--output_format', 'json',
        '--output_dir', path.dirname(filePath)
      ]);

      whisperProcess.on('error', (err) => {
        spinner.warn(chalk.yellow('Whisper binary not found in PATH.'));
        spinner.info('Please install whisper or whisper.cpp to enable local AI.');
      });

      whisperProcess.on('close', (code) => {
        if (code === 0) {
          spinner.succeed(chalk.green(`✔ Transcription complete: ${outputPath}`));
        } else {
          spinner.fail(chalk.red(`✘ Whisper exited with code ${code}`));
        }
      });

    } catch (error: any) {
      spinner.fail(chalk.red(`Transcription failed: ${error.message}`));
    }
  });

program
  .command('sync')
  .description('Sync a local result back to the cloud')
  .argument('<filePath>', 'Path to rendered file')
  .argument('<projectId>', 'Origin project ID')
  .action(async (filePath, projectId) => {
    const spinner = ora('Synchronizing with cloud storage...').start();

    try {
      const config = await fs.readJson(CONFIG_FILE).catch(() => ({}));
      const baseUrl = process.env.TSX_STUDIO_URL || 'https://tsx-studio.vercel.app';

      // Request signed URL
      const { data: { uploadUrl, key } } = await axios.post(`${baseUrl} /api/upload / url`, {
        fileName: path.basename(filePath),
        contentType: 'video/mp4'
      }, {
        headers: { 'Authorization': `Bearer ${config.secret} ` }
      });

      const fileData = await fs.readFile(filePath);
      await axios.put(uploadUrl, fileData, {
        headers: { 'Content-Type': 'video/mp4' }
      });

      // Notify backend of completion
      await axios.post(`${baseUrl} /api/render / sync`, {
        projectId,
        storageKey: key,
        status: 'UPLOADED'
      }, {
        headers: { 'Authorization': `Bearer ${config.secret} ` }
      });

      spinner.succeed(chalk.green('✔ Result synced to TSX Studio Cloud.'));
    } catch (err: any) {
      spinner.fail(chalk.red(\`✘ Sync failed: \${err.message}\`));
    }
  });

program.parse(process.argv);
