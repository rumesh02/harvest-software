// Test script for Top Buyers API Endpoint
// Run this in a frontend component or API testing tool

const testTopBuyersAPI = async () => {
  const baseURL = 'http://localhost:5000';
  
  // Sample farmer ID from your database
  const farmerId = 'google-oauth2|113283865769211281295';
  
  try {
    console.log('🚜 Testing Top Buyers API Endpoint...\n');
    
    // Test 1: Get top 5 buyers (default)
    console.log('📊 Test 1: Getting top 5 buyers (default)');
    const response1 = await fetch(`${baseURL}/api/farmers/${farmerId}/top-buyers`);
    const data1 = await response1.json();
    console.log('✅ Success:', data1);
    console.log(`Found ${data1.topBuyers.length} top buyers\n`);
    
    // Test 2: Get top 3 buyers with limit
    console.log('📊 Test 2: Getting top 3 buyers with limit');
    const response2 = await fetch(`${baseURL}/api/farmers/${farmerId}/top-buyers?limit=3`);
    const data2 = await response2.json();
    console.log('✅ Success:', data2);
    console.log(`Found ${data2.topBuyers.length} top buyers (limited to 3)\n`);
    
    // Test 3: Get top 1 buyer
    console.log('📊 Test 3: Getting top 1 buyer');
    const response3 = await fetch(`${baseURL}/api/farmers/${farmerId}/top-buyers?limit=1`);
    const data3 = await response3.json();
    if (data3.topBuyers.length > 0) {
      const topBuyer = data3.topBuyers[0];
      console.log('🏆 Top Buyer Details:');
      console.log(`   Name: ${topBuyer.merchantName}`);
      console.log(`   Email: ${topBuyer.merchantEmail}`);
      console.log(`   Phone: ${topBuyer.merchantPhone}`);
      console.log(`   District: ${topBuyer.merchantDistrict}`);
      console.log(`   Purchase Count: ${topBuyer.purchaseCount}`);
      console.log(`   Total Amount: Rs. ${topBuyer.totalAmount.toLocaleString()}`);
      console.log(`   Total Quantity: ${topBuyer.totalQuantity} kg`);
      console.log(`   Average Order Value: Rs. ${topBuyer.averageOrderValue}\n`);
    }
    
    // Test 4: Test with non-existent farmer
    console.log('📊 Test 4: Testing with non-existent farmer');
    const response4 = await fetch(`${baseURL}/api/farmers/non-existent-farmer/top-buyers`);
    const data4 = await response4.json();
    console.log('✅ Success (no buyers found):', data4);
    
  } catch (error) {
    console.error('❌ Error testing API:', error);
  }
};

// Usage in React component:
const FarmerTopBuyersComponent = () => {
  const [topBuyers, setTopBuyers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const fetchTopBuyers = async (farmerId, limit = 5) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/farmers/${farmerId}/top-buyers?limit=${limit}`);
      const data = await response.json();
      
      if (data.success) {
        setTopBuyers(data.topBuyers);
      } else {
        console.error('Failed to fetch top buyers:', data.message);
      }
    } catch (error) {
      console.error('Error fetching top buyers:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const farmerId = localStorage.getItem('user_id'); // Get farmer ID from storage
    if (farmerId) {
      fetchTopBuyers(farmerId);
    }
  }, []);
  
  return (
    <div>
      <h3>🏆 Top Buyers</h3>
      {loading ? (
        <p>Loading top buyers...</p>
      ) : topBuyers.length > 0 ? (
        <div>
          {topBuyers.map((buyer, index) => (
            <div key={buyer.merchantId} style={{ border: '1px solid #ddd', padding: '10px', margin: '10px 0' }}>
              <h4>#{index + 1} {buyer.merchantName}</h4>
              <p><strong>Email:</strong> {buyer.merchantEmail}</p>
              <p><strong>Phone:</strong> {buyer.merchantPhone}</p>
              <p><strong>District:</strong> {buyer.merchantDistrict}</p>
              <p><strong>Purchase Count:</strong> {buyer.purchaseCount}</p>
              <p><strong>Total Amount:</strong> Rs. {buyer.totalAmount.toLocaleString()}</p>
              <p><strong>Total Quantity:</strong> {buyer.totalQuantity} kg</p>
              <p><strong>Average Order Value:</strong> Rs. {buyer.averageOrderValue}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No buyers found yet. Start accepting bids to see your top buyers!</p>
      )}
    </div>
  );
};

// Export for use
// module.exports = { testTopBuyersAPI, FarmerTopBuyersComponent };
