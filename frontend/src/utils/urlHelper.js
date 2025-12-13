export const getFileUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    // Remove leading slash if present to avoid double slashes when joining
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    // Get API URL from env, modify to get base URL (remove /api)
    // Assuming VITE_API_URL includes /api at the end, if not we just use it
    let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    // If baseUrl ends with /api, remove it to get the root URL for static files
    if (baseUrl.endsWith('/api')) {
        baseUrl = baseUrl.slice(0, -4);
    }

    // Ensure baseUrl doesn't end with slash
    if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
    }

    return `${baseUrl}/${cleanPath}`;
};
