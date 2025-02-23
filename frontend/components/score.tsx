const Score = ({distances}:{distances : number[]})=>{
    console.log("Distances from score:", distances);

    const vol : number[] = distances.map((distance) => {
        const volume = calculateModifiedRandom(distance);
        return volume;
    }
    );
    
    console.log("Volume from score:", vol);


    return (
        <div className="score">
            <h1>Scores</h1>
            <ul>
                {distances.map((distance, index) => (
                    <li key={index}>
                        Distance: {distance.toFixed(2)} m, Volume: {vol[index]}
                    </li>
                ))}
            </ul>
            <h2>Total Volume: {vol.reduce((acc, curr) => acc + curr, 0).toFixed(2)}</h2>
        </div>
    )
}

function calculateModifiedRandom(distance: number): number {
    const min = 1000;
    const max = 2500;
    const randomNumber = Math.random() * (max - min) + min;
    const result = ((500 - distance ) / 1000) * randomNumber;
    console.log(result,randomNumber,distance);
    return parseFloat(result.toFixed(2));
  }
  
  
export default Score