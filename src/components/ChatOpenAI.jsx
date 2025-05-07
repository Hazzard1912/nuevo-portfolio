import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

const SYSTEM_PROMPT = `Eres EstusCode S.A.S., una empresa colombiana que ofrece desarrollo web, apps móviles y soluciones digitales. Tu única función es brindar cotizaciones y asesoría básica sobre nuestros servicios. Siempre das los precios en pesos colombianos (COP), nunca en dólares ni otra moneda.

Si el usuario saluda o escribe algo general como "hola", preséntate brevemente y dile que puedes ayudarle a cotizar una página web, app o sistema, y que puede contarte qué necesita o qué idea tiene.

Si el usuario describe lo que quiere (por ejemplo: "una tienda en línea", "una app para agendar citas", etc.), ofrécele el plan adecuado según nuestras opciones y precios.

Precios de referencia (COP):

Software para Empresas:
- Plan Lite: $3.000.000 – $4.000.000
- Plan Business: $6.000.000 – $8.000.000
- Plan Enterprise: $10.000.000 – $14.000.000

Páginas Web Profesionales:
- Web Básico: $1.200.000 – $1.800.000
- Web Pro: $2.500.000 – $4.000.000
- Tienda Online: $5.000.000 – $7.000.000

Aplicaciones para Celular:
- App Básica: $5.000.000 – $6.000.000
- App Interactiva: $7.000.000 – $9.000.000
- App Completa: $10.000.000 – $13.000.000

Mantenimiento Mensual:
- Web: $300.000 – $600.000
- Sistemas empresariales: $700.000 – $1.200.000
- Apps móviles: $900.000 – $1.500.000

Si el usuario pregunta algo completamente fuera del tema (como relaciones, viajes, etc.), responde: "Hola, te saluda EstusCode. Lamento decirte que solo puedo ayudarte con cotizaciones de nuestros servicios. ¿Te gustaría conocer los precios de alguno?"`;


export default function ChatOpenAI() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "system", content: SYSTEM_PROMPT }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const endRef = useRef(null);

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim()) return;
    const newMessages = [
      ...messages,
      { role: "user", content: input }
    ];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
  
    try {
      // Ahora llamamos a nuestro endpoint seguro
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages,
        }),
      });
  
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMsg = errorData.error?.message || res.statusText || "Error desconocido";
        setMessages([
          ...newMessages,
          { role: "assistant", content: `❌ Error: ${errorMsg}` },
        ]);
        console.error("API error:", errorMsg);
        setLoading(false);
        return;
      }
  
      const data = await res.json();
      setMessages([
        ...newMessages,
        { role: "assistant", content: data.choices[0].message.content },
      ]);
    } catch (error) {
      setMessages([
        ...newMessages,
        { role: "assistant", content: `❌ Error: ${error.message}` },
      ]);
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }

  // Scroll automático al último mensaje
  useEffect(() => {
    if (open && endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  // Filtra el mensaje de sistema para no mostrarlo en el chat
  const visibleMessages = messages.filter(m => m.role !== "system");

  return (
    <>
      {/* Botón flotante con tooltip */}
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 100 }}>
        <button
          className="bg-[#415A77] text-white rounded-full p-4 shadow-lg hover:bg-[#1B263B] transition-colors border-4 border-[#E0E1DD] relative"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir chat IA"
          style={{ fontSize: 28 }}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="12" fill="#415A77"/>
            <path d="M8 10h8M8 14h5" stroke="#E0E1DD" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          {/* Tooltip */}
          {showTooltip && (
            <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-[#1B263B] text-[#E0E1DD] px-4 py-2 rounded shadow-lg text-sm whitespace-nowrap animate-fadeIn border border-[#415A77]">
              Cotiza con IA tu página
            </span>
          )}
        </button>
      </div>

      {/* Chat grande y centrado */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D1B2A]/60 backdrop-blur-[6px] animate-fadeIn">
          <div className="w-full max-w-2xl h-[500px] flex flex-col bg-[#1B263B]/80 backdrop-blur-2xl rounded-2xl shadow-2xl relative">
            {/* Barra superior */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-[#415A77]/20 bg-[#1B263B]/80 rounded-t-2xl">
              <span className="text-[#E0E1DD] font-bold text-lg">Cotiza con IA</span>
              <div className="flex gap-2">
                <button
                  className="text-[#E0E1DD] hover:text-[#778DA9] text-2xl px-2"
                  onClick={() => setOpen(false)}
                  aria-label="Cerrar chat"
                >
                  ×
                </button>
              </div>
            </div>
            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-transparent custom-scroll">
              {visibleMessages.length === 0 && (
                <div className="text-[#778DA9] text-center">
                  ¡Hola! ¿En qué puedo ayudarte hoy?
                </div>
              )}
              {visibleMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`px-4 py-2 rounded-2xl max-w-[80%] shadow text-base font-medium animate-bubbleIn
                      ${msg.role === "user"
                        ? "bg-[#415A77] text-[#E0E1DD] rounded-br-sm"
                        : "bg-[#E0E1DD]/90 text-[#0D1B2A] rounded-bl-sm border border-[#778DA9]/40"}`}
                    style={{
                      fontFamily: "inherit",
                      wordBreak: "break-word"
                    }}
                  >
                    {msg.role === "assistant" ? (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              {loading && <div className="text-[#778DA9] text-center">Pensando...</div>}
              <div ref={endRef} />
            </div>
            {/* Input con botón de texto */}
            <form onSubmit={sendMessage} className="relative flex items-center px-6 py-4 bg-transparent rounded-b-2xl">
              <input
                className="flex-1 border border-[#778DA9]/40 rounded p-2 focus:outline-none focus:border-[#415A77] bg-[#E0E1DD]/70 text-[#0D1B2A] placeholder:text-[#415A77]"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu mensaje..."
                disabled={loading}
                style={{ fontFamily: "inherit" }}
              />
              <button
                type="submit"
                className="ml-2 bg-[#415A77] hover:bg-[#1B263B] text-[#E0E1DD] px-4 py-2 rounded transition flex items-center font-semibold"
                disabled={loading}
                aria-label="Enviar"
              >
                Enviar
              </button>
            </form>
          </div>
        </div>
      )}
      <style>{`
        .animate-fadeIn {
          animation: fadeIn 0.3s cubic-bezier(.4,0,.2,1) both;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .animate-bubbleIn {
          animation: bubbleIn 0.4s cubic-bezier(.4,0,.2,1) both;
        }
        @keyframes bubbleIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95);}
          to { opacity: 1; transform: translateY(0) scale(1);}
        }
        .custom-scroll {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #1B263B;
        }
        .custom-scroll::-webkit-scrollbar {
          width: 8px;
          background: #1B263B;
          border-radius: 8px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 8px;
          border: 2px solid #1B263B;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: #778DA9;
        }
      `}</style>
    </>
  );
} 