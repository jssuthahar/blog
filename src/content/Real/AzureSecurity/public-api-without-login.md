Browsing products without logging in was the requirement. It was the right call.

Trusting the request because it "came from our app" was the bug. 🔓

An Origin header and a custom client header are both strings the caller picks. Right-click the request in DevTools, Copy as cURL, paste it in a terminal — 200 OK, no app, no session.

Anonymous is not the same as unauthenticated.
Anonymous means you do not know who the user is.
Unauthenticated means you do not know anything — including how many times they called you today.

The fix is not a login screen. It is a fifteen-minute guest token your own API signs, scoped to read the catalogue and nothing else.

The customer still never sees a login screen. The call now carries an identity you can scope, count and revoke. ✅

#Azure #APISecurity #DotNet #AspNetCore #JWT #CloudSecurity #WebDevelopment #SoftwareEngineering #MSDEVBUILD #Firebase #AppSecurity #SoftwareArchitecture #DeveloperCommunity #LearnInPublic

Full article: https://blog.msdevbuild.com/blog/secure-api-without-login-azure
Watch: https://blog.msdevbuild.com/shorts/public-api-without-login
