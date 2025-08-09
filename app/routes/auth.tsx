import { usePuterStore } from "~/lib/puter"

export const meta = () => ([
    { title: "Resumind | Auth" },
    { name: "description", content: "Log into your account!" },
])

function auth() {
    const {isLoading, auth} = usePuterStore();
  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen flex item-center justify-center">
    <div className="gradient-border shadow-lg">
        <section className="flex flex-col gap-8 bg-white rounded-2xl p-10">
            <div className="flex flex-col item-center gap-2 text-center">
                <h1>Welcome</h1>
                <h2>Log In to continue your job journey</h2>
            </div>
            <div>
                {isLoading ? (
                    <button className="auth-button animate-pulse">
                        <p>Signing you in....</p>
                    </button>
                ) : (
                    <>
                    {auth.isAuthenticated ? (
                        <button className="auth-button" onClick={auth.signOut}>
                            <p>Log Out</p>
                        </button>
                    ) : (
                        <button className="auth-button" onClick={auth.signIn}>
                            <p>Log In</p>
                        </button>
                    )}
                    </>
                )}
            </div>
        </section>
    </div>
    </main>
  )
}

export default auth