import Image from 'next/image';

interface HelloWorldProps {
  title?: string;
  description?: string;
}

export default function HelloWorld({ 
  title = "Hello, World!", 
  description = "The Skeleton theme is a minimal Shopify theme." 
}: HelloWorldProps) {
  return (
    <div className="welcome w-full p-12 bg-gray-50" data-testid="hello-world-section">
      <div className="welcome-content grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h1 className="text-4xl font-bold mb-4">{title}</h1>
          <p className="text-gray-600">{description}</p>
        </div>
        <div className="icon flex justify-center">
          {/* 對應 assets/shoppy-x-ray.svg */}
          <Image 
            src="/shoppy-x-ray.svg" 
            alt="Shoppy X-ray" 
            width={300} 
            height={300} 
            priority
          />
        </div>
      </div>
    </div>
  );
}