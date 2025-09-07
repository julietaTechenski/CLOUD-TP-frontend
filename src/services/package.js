const apiUrl = process.env.REACT_APP_API_URL;


// request body:
/*
{
    "origin": 1,
    "destination": 2,
    "receiver": 1,
    "size": "L",
    "weight": "5.0"
}
*/
export async function postPackage(requestBody) {
    const res = await fetch(`${apiUrl}/packages`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
    });
    if (!res.ok) throw new Error("Failed to create package");
    return res.json();
}

/*
{
  "action": "SEND_DEPOT",
  "depot": 1,
  "comment": "Package sent to main depot"
}
*/
export async function postPackageTrack(packageCode, requestBody) {
    const res = await fetch(`${apiUrl}/packages/${packageCode}/tracks`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
    });
    if (!res.ok) throw new Error("Failed to create package");
    return res.json();
}


export async function getPackages() {
    const res = await fetch(`${apiUrl}/packages`);
    if (!res.ok) throw new Error("Failed to fetch packages");
    return res.json();
}

export async function getPackage(id) {
    const res = await fetch(`${apiUrl}/packages/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch package with id ${id}`);
    return res.json();
}

export async function getLatestTrack(code) {
    const res = await fetch(`${apiUrl}/packages/${code}/tracks/latest`);
    if (!res.ok) throw new Error("Failed to fetch track");
    return res.json();
}


export async function getTracks(code) {
    const res = await fetch(`${apiUrl}/packages/${code}/tracks`);
    if (!res.ok) throw new Error("Failed to fetch tracks");
    return res.json();
}

