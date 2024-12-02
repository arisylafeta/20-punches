import { ChatWindow } from "@/components/ChatWindow";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center flex-1 px-4 sm:px-20 text-center">
        <div className="p-6 md:p-12 rounded-lg bg-[#25252d] w-full max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Welcome to 20 Punches
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            Your personal investment advisor powered by Warren Buffett&apos;s wisdom
          </p>
          <a 
            href="/chat"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors"
          >
            Start Chatting with Warren →
          </a>
        </div>
      </main>
    </div>
  );
}
