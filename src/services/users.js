const apiUrl = process.env.REACT_APP_API_URL;

export async function getUsers() {
    const res = await fetch(`${apiUrl}/users`);
    if (!res.ok) throw new Error("Failed to fetch users");
    return res.json();
}

export async function getUserById(id) {
    const res = await fetch(`${apiUrl}/users/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch user with id ${id}`);
    return res.json();
}