import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export async function POST(req: NextRequest) {
  try {
    const { items, title, clientName } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Budget items are required for analysis." }, { status: 400 });
    }

    const itemsStr = items.map(it => `- ${it.name} (Qtde: ${it.quantity}, Preço Unitário: R$ ${it.price})`).join("\n");
    
    const prompt = `Analise o seguinte orçamento empresarial e ofereça dicas de controle financeiro, otimização de custo e sugestões para negociação com fornecedores.
    
Título do Orçamento: ${title || "Geral"}
Cliente: ${clientName || "Não especificado"}
Itens do Orçamento:
${itemsStr}

Gere uma resposta estruturada de controle financeiro profissional em português do Brasil:
1. Três insights de economia ou otimização específicos para estes itens.
2. Uma sugestão de fornecedores reais e populares no Brasil que atendam a essa categoria (ex: Kalunga para papelaria, Kabum/Intelbras para tecnologia, Leroy Merlin para reforma/materiais, etc.).
3. Uma mensagem de template estruturada de pedido de cotação (RFP) em formato amigável para envio direto no WhatsApp ou E-mail aos fornecedores.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["insights", "suggestedSuppliers", "rfpTemplateWhatsApp", "rfpTemplateEmail", "savingEstimatePercent"],
          properties: {
            insights: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Three tailored cost optimization insights or alerts"
            },
            suggestedSuppliers: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Real Brazilian companies matching this category of goods/services"
            },
            rfpTemplateWhatsApp: {
              type: Type.STRING,
              description: "Ready-to-copy WhatsApp template to request quote from supplier in Portuguese"
            },
            rfpTemplateEmail: {
              type: Type.STRING,
              description: "Ready-to-copy professional email RFP template in Portuguese"
            },
            savingEstimatePercent: {
              type: Type.NUMBER,
              description: "Estimated percentage of possible savings with smart supplier negotiation (e.g. 12)"
            }
          }
        },
        systemInstruction: "You are an expert brazilian procurement officer and business financial consultant. Give sharp, professional, realistic market advice in Brazilian Portuguese. Ensure JSON matches the schema perfectly.",
      }
    });

    const textToParse = response.text || "{}";
    const data = JSON.parse(textToParse.trim());
    return NextResponse.json({
      success: true,
      analysis: data
    });

  } catch (error: any) {
    console.error("Error in quote-assist route:", error);
    return NextResponse.json({ error: error.message || "Failed to analyze budget items" }, { status: 500 });
  }
}
