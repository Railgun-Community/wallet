let log: Optional<(msg: any) => void>;
let error: Optional<(err: any) => void>;

export const sendMessage = (msg: any) => {
  if (log) log(msg);
};

export const sendErrorMessage = (err: any) => {
  if (error) error(err);
};

export const setLoggers = (
  logFunc: Optional<(msg: any) => void>,
  errorFunc: Optional<(err: any) => void>,
) => {
  log = logFunc;
  error = errorFunc;
};
