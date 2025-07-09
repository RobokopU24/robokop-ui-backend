import { AxiosError } from 'axios';

function isString(value: unknown): value is string {
  return typeof value === 'string' || value instanceof String;
}

interface ErrorOutput {
  message: string;
  status: 'error';
}

export function handleAxiosError(error: AxiosError): ErrorOutput {
  const output: ErrorOutput = { message: '', status: 'error' };
  if (error.response) {
    const axiosErrorPrefix = `Error in response with code ${error.response.status}: `;
    const data = error.response.data;
    if (isString(data)) {
      output.message = `${axiosErrorPrefix} ${data}`;
    } else {
      output.message = `${axiosErrorPrefix} Unparseable error response.`;
    }
  } else {
    output.message = 'Unknown axios exception encountered.';
  }

  output.status = 'error';
  return output;
}
