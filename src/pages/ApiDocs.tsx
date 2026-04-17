import { ApiReferenceReact } from '@scalar/api-reference-react';
import '@scalar/api-reference-react/style.css';


export default function ApiDocs() {

  return (
    <div className="min-h-screen w-full bg-[#070a12] relative overflow-x-hidden">


      <div className="relative z-10 min-h-screen">
        <ApiReferenceReact
          configuration={{
            url: '/openapi.json',
            layout: 'modern',
            darkMode: true,
          }}
        />
      </div>
    </div>
  );
}
