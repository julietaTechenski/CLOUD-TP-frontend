const apiUrl = process.env.REACT_APP_API_URL;

export async function getDepots() {
    const res = await fetch(`${apiUrl}/depots`);
    if (!res.ok) throw new Error("Failed to fetch depots");
    return res.json();
}