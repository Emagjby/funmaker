export default function Home() {
  // TODO: Add auth check later
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <h1 className="text-4xl font-bold mb-4">Bookmaker</h1>
      <p className="text-xl mb-8">Risk-free betting with virtual points</p>
      
      <div className="max-w-3xl mb-10">
        <p className="mb-4">
          Welcome to Bookmaker! Place bets on your favorite events using virtual points.
          Our smart odds system adjusts in real-time based on everyone&apos;s betting patterns.
        </p>
        
        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="p-6 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">Virtual Points</h2>
            <p>Start with 1,000 points and bet without risking real money.</p>
          </div>
          
          <div className="p-6 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">Live Odds</h2>
            <p>Watch odds change in real-time based on betting activity.</p>
          </div>
          
          <div className="p-6 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">Live Updates</h2>
            <p>Get notifications as events unfold and bets are settled.</p>
          </div>
          
          <div className="p-6 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">Leaderboard</h2>
            <p>Compete with friends and climb the ranks!</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex flex-wrap gap-4 justify-center">
        <button 
          className="px-6 py-3 text-white bg-blue-600 rounded-md shadow-md hover:bg-blue-700 transition-all"
          onClick={() => console.log('Sign up clicked')} // Will implement auth later
        >
          Get Started
        </button>
        <button 
          className="px-6 py-3 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-all"
        >
          How It Works
        </button>
      </div>
    </div>
  );
} 