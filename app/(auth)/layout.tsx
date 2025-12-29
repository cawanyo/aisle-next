import { Suspense } from "react";

export default async function ProjectLayout({ children }: { children: React.ReactNode;  }) {  
    return (

          <Suspense fallback={<div>Loading project...</div>}>
          {children}
          </Suspense>

    );

}