import netlifyIdentity from 'netlify-identity-widget';

declare global {
  interface Window {
    netlifyIdentity: typeof netlifyIdentity;
  }
}
