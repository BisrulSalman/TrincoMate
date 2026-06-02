
const About = () => {
  return (
    <div className="container section-padding animate-fade-in" style={{ maxWidth: '800px' }}>
      <h1 style={{ fontSize: '36px', marginBottom: '20px', textAlign: 'center' }}>About TrincoMate</h1>
      <div className="card">
        <p style={{ marginBottom: '20px', fontSize: '16px', lineHeight: '1.8' }}>
          TrincoMate is your travel companion for discovering Trincomalee, Sri Lanka. 
          Our mission is to connect travelers with trusted local experiences, accommodations, and services 
          while helping local businesses thrive.
        </p>
        <p style={{ marginBottom: '20px', fontSize: '16px', lineHeight: '1.8' }}>
          Whether you're searching for a beachfront resort, a guided tour of historic temples, 
          or the best local dining spots, TrincoMate is built to make every itinerary effortless.
        </p>
        <h3 style={{ fontSize: '20px', marginTop: '30px', marginBottom: '15px' }}>Our Values</h3>
        <ul style={{ listStyleType: 'disc', paddingLeft: '20px', lineHeight: '1.8' }}>
          <li>Promoting responsible tourism in Trincomalee</li>
          <li>Supporting local communities and service providers</li>
          <li>Delivering a seamless booking experience for every traveler</li>
          <li>Ensuring quality, safety, and authentic local insight</li>
        </ul>
      </div>
    </div>
  );
};

export default About;
