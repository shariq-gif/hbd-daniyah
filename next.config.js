/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep this false. React StrictMode's dev-only double-mount re-applies
  // Framer Motion's `initial` state (opacity:0) AFTER the enter animation
  // runs, which freezes every animated element invisible. Turning it off
  // makes the mount animations play correctly.
  reactStrictMode: false,
};

module.exports = nextConfig;
