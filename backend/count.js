exports.handler = async (event) => {
    try {
        console.log('Received event:', JSON.stringify(event));

        // Parse the payload JSON
        const { rows } = event;
        console.log('Received rows:', rows);

        // Filter rows with salary above 4000 and below 400
        const above4000 = [];
        const below4000 = [];
        rows.forEach(row => {
            const salary = parseInt(row.salary);
            if (salary >= 4000) {
                above4000.push(row);
            } else if (salary < 4000) {
                below4000.push(row);
            }
        });

        // Count rows where name starts with the same letter for all initial rows
        const nameCounts = {};
        rows.forEach(row => {
            const firstLetter = row.name.charAt(0).toLowerCase();
            nameCounts[firstLetter] = (nameCounts[firstLetter] || 0) + 1;
        });

        return {
            above4000,
            below4000,
            nameCounts
        };
    } catch (error) {
        console.error('Error processing Lambda event:', error);
        throw error; // Re-throwing the error to provide detailed information
    }
};
