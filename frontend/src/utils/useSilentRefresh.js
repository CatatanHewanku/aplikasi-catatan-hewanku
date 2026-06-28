import { useState } from "react";

export const useSilentRefresh = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const executeWithRetry = async (apiCall, { defaultLoadingText = "Processing...", onSuccess, onError }) => {
    setIsLoading(true);
    setLoadingText(defaultLoadingText);

    const maxRetries = 3;
    const retryDelayMs = 15000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await apiCall();
        
        if (onSuccess) await onSuccess(result);
        
        setIsLoading(false);
        return; 

      } catch (backendError) {
        const status = backendError?.response?.status || backendError?.status;
        
        const isNetworkError =
          backendError?.message === 'Network Error' ||
          backendError?.code === 'ECONNABORTED' ||
          backendError?.message?.toLowerCase().includes('timeout') ||
          backendError?.message?.toLowerCase().includes('failed to fetch');

        const isServerAwake = status 
            ? (status !== 502 && status !== 503 && status !== 504) 
            : !isNetworkError;

        if (isServerAwake || attempt === maxRetries) {
          if (onError) onError(backendError, status);
          setIsLoading(false);
          return; 
        }

        if (attempt === 1) {
          setLoadingText("Waking up system...");
        } else if (attempt === 2) {
          setLoadingText("Almost ready...");
        }

        await new Promise(resolve => setTimeout(resolve, retryDelayMs));
      }
    }
  };

  return { isLoading, loadingText, executeWithRetry };
};