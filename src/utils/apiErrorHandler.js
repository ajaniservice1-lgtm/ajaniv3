/**
 * API Error Handler for detecting authentication failures
 */

export const initApiErrorDetection = () => {
  // Store original fetch
  const originalFetch = window.fetch;
  
  // Intercept fetch requests
  window.fetch = async function(...args) {
    try {
      const response = await originalFetch.apply(this, args);
      
      // Check for 401 Unauthorized
      if (response.status === 401) {
        const url = args[0]?.url || args[0] || '';
        
        // Don't trigger for login/register endpoints
        if (!url.includes('/login') && !url.includes('/register') && !url.includes('/verify')) {
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent("auth-error", {
              detail: {
                type: "api_unauthorized",
                message: "Your session has expired. Please login again.",
                url: url,
                timestamp: new Date().toISOString()
              }
            }));
          }, 500);
        }
      }
      
      // Check for 403 Forbidden
      if (response.status === 403) {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("auth-error", {
            detail: {
              type: "api_forbidden",
              message: "Access denied. Your session may have expired.",
              timestamp: new Date().toISOString()
            }
          }));
        }, 500);
      }
      
      return response;
    } catch (error) {
      // Network errors
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        window.dispatchEvent(new CustomEvent("auth-error", {
          detail: {
            type: "network_error",
            message: "Network error. Please check your connection.",
            timestamp: new Date().toISOString()
          }
        }));
      }
      
      throw error;
    }
  };
  
  // Store original XMLHttpRequest
  const OriginalXMLHttpRequest = window.XMLHttpRequest;
  
  if (OriginalXMLHttpRequest) {
    window.XMLHttpRequest = class extends OriginalXMLHttpRequest {
      open(method, url, async, user, password) {
        this._url = url;
        super.open(method, url, async, user, password);
      }
      
      set onreadystatechange(handler) {
        super.onreadystatechange = (event) => {
          if (this.readyState === 4) {
            if (this.status === 401 || this.status === 403) {
              if (!this._url?.includes('/login') && !this._url?.includes('/register')) {
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent("auth-error", {
                    detail: {
                      type: this.status === 401 ? "xhr_unauthorized" : "xhr_forbidden",
                      message: "Session expired. Please login again.",
                      timestamp: new Date().toISOString()
                    }
                  }));
                }, 500);
              }
            }
          }
          
          if (handler) handler(event);
        };
      }
    };
  }
  
  console.log("API error detection initialized");
};