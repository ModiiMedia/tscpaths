const initLogs = (verbose?: boolean) => {
  const log = (...args: any[]): void => {
    if (verbose) {
      console.log(...args);
    }
  };
  return log;
};

export default initLogs;
