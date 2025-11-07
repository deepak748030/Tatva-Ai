const TatvaModel = require('../models/TatvaModel');

class SystemController {
    constructor() {
        this.tatvaModel = new TatvaModel();
    }

    health(req, res) {
        res.json({
            status: 'OK',
            message: 'तत्व AI सर्वर चालू बा!',
            timestamp: new Date().toISOString(),
            version: '2.0.0',
            ollama: {
                endpoint: 'http://194.164.148.9:18480/',
                model: 'gemma2:9b'
            },
            language: 'भोजपुरी (Bhojpuri)'
        });
    }

    async info(req, res) {
        // Check Ollama health
        let ollamaStatus = 'unknown';
        let a4fStatus = 'unknown';
        try {
            const health = await this.tatvaModel.checkHealth();
            ollamaStatus = health.status;
        } catch (error) {
            ollamaStatus = 'error';
        }

        // Check A4F health
        try {
            const a4fHealth = await this.a4fModel.checkA4FHealth();
            a4fStatus = a4fHealth.status;
        } catch (error) {
            a4fStatus = 'error';
        }

        res.json({
            name: 'Tatva AI API Server',
            description: 'द्विभाषी AI सहायक - भोजपुरी आ अंग्रेजी में विशेषज्ञ',
            version: '2.0.0',
            ollama: {
                endpoint: 'http://194.164.148.9:18480/',
                model: 'gemma2:9b',
                status: ollamaStatus
            },
            a4f: {
                endpoint: 'https://api.a4f.co/v1/chat/completions',
                model: 'provider-1/chatgpt-4o-latest',
                status: a4fStatus
            },
            endpoints: {
                'POST /api/chat': 'मुख्य चैट एंडपॉइंट - बातचीत का इतिहास सहित',
                'POST /api/chat/stream': 'स्ट्रीमिंग चैट एंडपॉइंट - रियल-टाइम जवाब',
                'POST /api/a4f-chat': 'A4F चैट एंडपॉइंट - उन्नत AI मॉडल के साथ',
                'POST /api/a4f-chat/stream': 'A4F स्ट्रीमिंग चैट - रियल-टाइम A4F जवाब',
                'GET /api/chat/history': 'सभी बातचीत की सूची (संरक्षित)',
                'GET /api/chat/history/:id': 'विशिष्ट बातचीत देखें (संरक्षित)',
                'DELETE /api/chat/history/:id': 'बातचीत हटाएं (संरक्षित)',
                'GET /api/chat/stats': 'बातचीत के आंकड़े (संरक्षित)',
                'POST /api/simple-chat': 'सरल चैट एंडपॉइंट - बिना इतिहास',
                'GET /api/health': 'सर्वर स्वास्थ्य जांच',
                'GET /api/info': 'API जानकारी',
                'POST /api/auth/register': 'नया उपयोगकर्ता पंजीकरण',
                'POST /api/auth/login': 'उपयोगकर्ता लॉगिन',
                'POST /api/ai-models': 'नया AI मॉडल बनाएं (संरक्षित)',
                'GET /api/ai-models': 'सभी AI मॉडल देखें (संरक्षित)',
                'GET /api/ai-models/:id': 'विशिष्ट AI मॉडल देखें (संरक्षित)',
                'PUT /api/ai-models/:id': 'AI मॉडल अपडेट करें (संरक्षित)',
                'DELETE /api/ai-models/:id': 'AI मॉडल हटाएं (संरक्षित)',
                'GET /api/users': 'सभी उपयोगकर्ता देखें (संरक्षित)',
                'GET /api/users/:id': 'विशिष्ट उपयोगकर्ता देखें (संरक्षित)',
                'PUT /api/users/:id': 'उपयोगकर्ता अपडेट करें (संरक्षित)',
                'DELETE /api/users/:id': 'उपयोगकर्ता हटाएं (संरक्षित)'
            },
            languages: ['भोजपुरी (Bhojpuri)', 'अंग्रेजी (English)'],
            origin: 'बिहार, भारत (Bihar, India)',
            features: [
                'उन्नत बातचीत इतिहास प्रबंधन',
                'रियल-टाइम स्ट्रीमिंग चैट',
                'भोजपुरी भाषा में विशेषज्ञता',
                'A4F API एकीकरण - उन्नत AI मॉडल',
                'सुरक्षित उपयोगकर्ता प्रमाणीकरण',
                'बातचीत के आंकड़े और विश्लेषण'
            ]
        });
    }

    root(req, res) {
        res.json({
            message: 'नमस्कार! Welcome to Tatva AI API Server',
            description: 'बिहार से आपका द्विभाषी AI सहायक',
            documentation: 'API दस्तावेज़ के लिए /api/info पर जाएं',
            version: '2.0.0',
            greeting: 'का हाल बा? तत्व से बात करीं!'
        });
    }
}

module.exports = SystemController;
