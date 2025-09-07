const apiUrl = process.env.REACT_APP_API_URL;

export async function getDepots() {
    const token = "";
    const res = await fetch(`${apiUrl}/depots`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    });
    if (!res.ok) throw new Error("Failed to fetch depots");
    return res.json();
}