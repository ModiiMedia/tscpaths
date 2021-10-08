const initLogs = (verbose?: boolean, silent = false) => {
    const verboseLog = (...args: any[]): void => {
        if (verbose && !silent) {
            console.log(...args);
        }
    };
    const log = (msg: any) => {
        if (!silent) {
            console.log(msg);
        }
    };
    return { verboseLog, log };
};

export default initLogs;
