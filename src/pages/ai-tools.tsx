import { useState } from 'react'

export default function AITools() {
    const [type, setType] = useState<"enhance_cv" | "cover_letter">("enhance_cv")
    const [cv, setCV] = useState("")
    const [jobDescription, setJobDescription] = useState("")
    const [result, setResult] = useState("")

}
