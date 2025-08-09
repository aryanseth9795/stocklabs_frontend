const serverUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";


//Apis Server Url for fetching
const serverApiUrl:string = `${serverUrl}/api/v1`;

export { serverUrl, serverApiUrl };
