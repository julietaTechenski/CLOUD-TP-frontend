const apiUrl = process.env.REACT_APP_API_URL;

export async function getUsers() {
    const res = await fetch(`${apiUrl}/users`);
    if (!res.ok) throw new Error("Failed to fetch users");
    return res.json();
}
