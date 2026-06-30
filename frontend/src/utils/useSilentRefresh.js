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
        const errorMessage = (backendError?.response?.data?.message || backendError?.message || "").toLowerCase();
        
        const isConnectionIssue =
          backendError?.message === 'Network Error' ||
          backendError?.code === 'ECONNABORTED' ||
          errorMessage.includes('timeout') ||
          errorMessage.includes('failed to fetch') ||
          errorMessage.includes('failed to connect') ||
          errorMessage.includes('network');

        let isSystemAwake = true;

        if (isConnectionIssue) {
          isSystemAwake = false;
        } else if (!status || status === 502 || status === 503 || status === 504) {
          isSystemAwake = false;
        }

        if (isSystemAwake || attempt === maxRetries) {
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