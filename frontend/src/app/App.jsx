import "./App.css"
import {Editor} from "@monaco-editor/react"
import { MonacoBinding } from "y-monaco"
import { useRef, useMemo, useEffect , useState } from "react"
import * as Y from "yjs"
import { SocketIOProvider } from "y-socket.io"

function App() {
  const editorRef = useRef(null)
  const providerRef = useRef(null)
  const bindingRef = useRef(null)
  const [editorReady, setEditorReady] = useState(false)

  const [ username, setUsername ] = useState(() =>{
    return new URLSearchParams(window.location.search).get("username") || ""
  })

  const [users, setUsers ] = useState([])

  const ydoc = useMemo(() => new Y.Doc(), [])
  const yText = useMemo(() => ydoc.getText("monaco"), [ydoc])

  const handleMount = (editor) =>{
    editorRef.current = editor
    setEditorReady(true)
  }

  const handleJoin = (e) =>{
    e.preventDefault()
    const joinedUsername = e.target.username.value.trim()
    if (!joinedUsername) return

    setUsername(joinedUsername)
    window.history.pushState({}, "", `?username=${encodeURIComponent(joinedUsername)}`)
  }

  useEffect(() => {
    if (!username || !editorReady || !editorRef.current) return

    providerRef.current?.destroy()
    bindingRef.current?.destroy()

    const provider = new SocketIOProvider(
      "http://localhost:3000",
      "monaco",
      ydoc,
      { autoConnect: true }
    )
    providerRef.current = provider
    const now = Date.now()
    provider.awareness.setLocalStateField("user", {
      username,
      heartbeat: now
    })

    const updateUsers = () => {
      const states = Array.from(provider.awareness.getStates().entries())
      const uniqueUsers = new Map()

      states.forEach(([clientId, state]) => {
        const user = state?.user
        const heartbeat = user?.heartbeat
        const userName = user?.username

        if (
          userName &&
          typeof heartbeat === "number" &&
          Date.now() - heartbeat < 15000
        ) {
          uniqueUsers.set(userName, {
            id: clientId,
            username: userName
          })
        }
      })

      setUsers(Array.from(uniqueUsers.values()))
    }

    updateUsers()
    provider.awareness.on("change", updateUsers)

    const heartbeatInterval = window.setInterval(() => {
      provider.awareness.setLocalStateField("user", {
        username,
        heartbeat: Date.now()
      })
    }, 5000)

    const staleUserInterval = window.setInterval(updateUsers, 5000)

    function handleBeforeUnload() {
      provider.awareness.setLocalStateField("user", null)
    }
    window.addEventListener("beforeunload", handleBeforeUnload)

    bindingRef.current = new MonacoBinding(
      yText,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
      provider.awareness
    )

    return () => {
      provider.awareness.off("change", updateUsers)
      provider.awareness.setLocalStateField("user", null)
      window.clearInterval(heartbeatInterval)
      window.clearInterval(staleUserInterval)
      window.removeEventListener("beforeunload", handleBeforeUnload)
      bindingRef.current?.destroy()
      provider.destroy()
      bindingRef.current = null
      providerRef.current = null
    }
  }, [
    editorReady,
    username,
    ydoc,
    yText
  ])

  if(!username){
    return (
      <main className="h-screen w-full bg-gray-950 flex gap-4 p-4 items-center justify-center">
        <form
        onSubmit={handleJoin}
         className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Enter your username"
            className="p-2 rounded-lg bg-gray-800 text-white"
            name = "username"
          />
          <button
            className="p-2 rounded-lg bg-amber-50 text-gray-950 font-bold"
          >
            Join
          </button>
        </form>
      </main>
    )
  }

  return (
    <main className="h-screen w-full bg-gray-950 flex gap-4 p-4">
      <aside className="h-full w-1/4 bg-amber-50 rounded-lg">
        <h2 className="text-2xl font-bold p-4 border-b border-gray-300">Users</h2>
        <ul className="p-4">
          {users.map((user) => (
            <li key={user.id} className="p-2 bg-gray-800 text-white rounded mb-2">
              {user.username}
            </li>
          ))}
        </ul>
      </aside>

      <section className="h-full w-3/4 bg-neutral-800 rounded-lg overflow-hidden">
        <Editor
          height="100%"
          width="100%"
          defaultLanguage="javascript"
          theme="vs-dark"
          onMount={handleMount}
        />
      </section>
    </main>
  );
}

export default App;
