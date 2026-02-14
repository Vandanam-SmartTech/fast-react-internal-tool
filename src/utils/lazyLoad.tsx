import { lazy, Suspense } from 'react';

const Loading = () => <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh'}}>Loading...</div>;

export const lazyLoad = (importFunc: () => Promise<any>) => {
  const LazyComponent = lazy(importFunc);
  return (props: any) => (
    <Suspense fallback={<Loading />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};
