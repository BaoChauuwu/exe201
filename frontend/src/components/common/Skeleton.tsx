export const Skeleton = ({ width = '100%', height = '20px', borderRadius = '8px', style = {} }: { width?: string | number, height?: string | number, borderRadius?: string | number, style?: React.CSSProperties }) => {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: 'var(--color-border)',
        backgroundImage: 'linear-gradient(90deg, rgba(255, 255, 255, 0) 0, rgba(255, 255, 255, 0.2) 20%, rgba(255, 255, 255, 0.5) 60%, rgba(255, 255, 255, 0))',
        backgroundSize: '200px 100%',
        backgroundRepeat: 'no-repeat',
        animation: 'shimmer 1.5s infinite',
        ...style
      }}
    />
  );
};
