let log: Optional<(msg: string) => void>;
let error: Optional<(err: Error | string) => void>;

export const sendMessage = (msg: string) => {
  if (log) log(msg);
};

export const sendErrorMessage = (err: Error | string) => {
  if (error) error(err);
};

export const setLoggers = (
  logFunc: Optional<(msg: string) => void>,
  errorFunc: Optional<(err: Error | string) => void>,
) => {
  log = logFunc;
  error = errorFunc;
};
