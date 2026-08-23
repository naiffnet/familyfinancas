const SESSION_KEY = 'ff_session_token';

export const api = window.api ? window.api : new Proxy({}, {
  get(target, prop) {
    if (prop in target) return target[prop];
    return async (...args) => {
      const channel = prop;
      const origin = window.location.origin;
      const token = localStorage.getItem(SESSION_KEY) || '';
      
      const res = await fetch(`${origin}/api/rpc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ channel, args })
      });

      if (res.status === 401) {
        localStorage.removeItem(SESSION_KEY);
        if (token) {
          window.location.reload();
        }
        return;
      }

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (data.sessionToken) {
        localStorage.setItem(SESSION_KEY, data.sessionToken);
      }

      if (data.result && data.result.isWebDownload && data.result.content) {
        const binaryString = atob(data.result.content);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes.buffer], { type: 'application/octet-stream' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = data.result.filename || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return { success: true };
      }

      return data.result;
    };
  }
});
