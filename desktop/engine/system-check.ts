import os from 'os';

export interface SystemInfo {
    cpu: string;
    cores: number;
    memoryTotalGB: number;
    memoryFreeGB: number;
    platform: string;
    isCompatible: boolean;
}

export async function checkSystem(): Promise<SystemInfo> {
    const cpus = os.cpus();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();

    const info = {
        cpu: cpus[0].model,
        cores: cpus.length,
        memoryTotalGB: Math.round(totalMemory / (1024 ** 3)),
        memoryFreeGB: Math.round(freeMemory / (1024 ** 3)),
        platform: process.platform,
        isCompatible: true
    };

    // Basic compatibility check (e.g., Remotion needs at least 8GB RAM recommended)
    if (info.memoryTotalGB < 4) {
        info.isCompatible = false;
    }

    return info;
}
