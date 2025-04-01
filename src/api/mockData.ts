
import { User, Submission, Review, DashboardStats } from '../types';

// Mock Users
export const users: User[] = [
  {
    id: 'user-1',
    name: 'Admin User',
    email: 'admin@journal.com',
    role: 'admin',
    avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff',
    affiliation: 'Journal Management System',
    bio: 'System administrator with full access to journal functions.'
  },
  {
    id: 'user-2',
    name: 'Editor Smith',
    email: 'editor@journal.com',
    role: 'editor',
    avatar: 'https://ui-avatars.com/api/?name=Editor+Smith&background=2563eb&color=fff',
    affiliation: 'University of Science',
    bio: 'Chief Editor with expertise in computer science'
  },
  {
    id: 'user-3',
    name: 'Reviewer Johnson',
    email: 'reviewer@journal.com',
    role: 'reviewer',
    avatar: 'https://ui-avatars.com/api/?name=Reviewer+Johnson&background=7c3aed&color=fff',
    affiliation: 'Tech University',
    bio: 'Expert reviewer in artificial intelligence'
  },
  {
    id: 'user-4',
    name: 'Author Davis',
    email: 'author@journal.com',
    role: 'author',
    avatar: 'https://ui-avatars.com/api/?name=Author+Davis&background=10b981&color=fff',
    affiliation: 'Research Institute',
    bio: 'Researcher in machine learning and robotics'
  },
  {
    id: 'user-5',
    name: 'Reader Brown',
    email: 'reader@journal.com',
    role: 'reader',
    avatar: 'https://ui-avatars.com/api/?name=Reader+Brown&background=f59e0b&color=fff',
    affiliation: 'Graduate Student',
    bio: 'Interested in latest research in technology'
  },
];

// Mock Submissions
export const submissions: Submission[] = [
  {
    id: 'sub-1',
    title: 'Advances in Quantum Computing Algorithms',
    abstract: 'This paper presents novel quantum computing algorithms that significantly improve processing efficiency for complex computational problems.',
    authors: ['Author Davis', 'Co-Author Wilson'],
    keywords: ['quantum computing', 'algorithms', 'qubits', 'optimization'],
    status: 'published',
    submittedDate: '2023-01-15T10:30:00Z',
    updatedDate: '2023-03-10T14:45:00Z',
    document: 'https://example.com/documents/quantum_computing_paper.pdf',
    coverLetter: 'We are pleased to submit our manuscript on quantum computing algorithms...',
    correspondingAuthor: 'user-4',
    reviewers: ['user-3'],
    editorId: 'user-2',
    category: 'Computer Science',
    publicationDate: '2023-03-15T00:00:00Z',
    reviews: [
      {
        id: 'rev-1',
        submissionId: 'sub-1',
        reviewerId: 'user-3',
        completed: true,
        decision: 'accept',
        comments: 'This paper presents significant advances in the field. The algorithms are well-described and the results are promising.',
        privateComments: 'High quality paper worth publishing with minor corrections.',
        submittedDate: '2023-02-20T09:15:00Z',
        dueDate: '2023-02-25T00:00:00Z',
        criteria: {
          methodology: 4,
          relevance: 5,
          clarity: 4,
          originality: 5,
          overall: 4.5,
        },
      }
    ],
    decision: {
      status: 'accept',
      comments: 'After careful review, we are pleased to accept this paper for publication.',
      date: '2023-03-01T11:20:00Z',
    },
  },
  {
    id: 'sub-2',
    title: 'Machine Learning Approaches to Climate Prediction',
    abstract: 'This study explores how machine learning can enhance climate prediction models, offering improved accuracy for long-term forecasts.',
    authors: ['Author Davis', 'Co-Author Thompson'],
    keywords: ['machine learning', 'climate science', 'prediction models', 'neural networks'],
    status: 'under_review',
    submittedDate: '2023-04-05T08:20:00Z',
    updatedDate: '2023-04-05T08:20:00Z',
    document: 'https://example.com/documents/climate_ml_paper.pdf',
    coverLetter: 'We believe our research on machine learning for climate prediction represents a significant contribution...',
    correspondingAuthor: 'user-4',
    reviewers: ['user-3'],
    editorId: 'user-2',
    category: 'Environmental Science',
    reviews: [
      {
        id: 'rev-2',
        submissionId: 'sub-2',
        reviewerId: 'user-3',
        completed: false,
        comments: '',
        dueDate: '2023-05-10T00:00:00Z',
        criteria: {
          methodology: 0,
          relevance: 0,
          clarity: 0,
          originality: 0,
          overall: 0,
        },
      }
    ],
  },
  {
    id: 'sub-3',
    title: 'Blockchain Solutions for Healthcare Data Management',
    abstract: 'This paper proposes a blockchain-based framework for secure management of healthcare data that preserves patient privacy while enabling necessary access for healthcare providers.',
    authors: ['New Researcher Lee', 'Author Davis'],
    keywords: ['blockchain', 'healthcare', 'data privacy', 'security'],
    status: 'submitted',
    submittedDate: '2023-05-20T11:45:00Z',
    updatedDate: '2023-05-20T11:45:00Z',
    document: 'https://example.com/documents/blockchain_healthcare_paper.pdf',
    coverLetter: 'Our research addresses critical issues in healthcare data security...',
    correspondingAuthor: 'user-4',
    category: 'Healthcare Technology',
  },
  {
    id: 'sub-4',
    title: 'Natural Language Processing for Legal Document Analysis',
    abstract: 'This research explores the application of Natural Language Processing techniques for analyzing legal documents to extract key information and identify patterns.',
    authors: ['Legal Tech Researcher', 'Author Davis'],
    keywords: ['NLP', 'legal tech', 'document analysis', 'machine learning'],
    status: 'revision_required',
    submittedDate: '2023-02-10T14:30:00Z',
    updatedDate: '2023-04-15T09:20:00Z',
    document: 'https://example.com/documents/nlp_legal_paper.pdf',
    coverLetter: 'We present a novel approach to legal document analysis using NLP...',
    correspondingAuthor: 'user-4',
    reviewers: ['user-3'],
    editorId: 'user-2',
    category: 'Legal Technology',
    reviews: [
      {
        id: 'rev-3',
        submissionId: 'sub-4',
        reviewerId: 'user-3',
        completed: true,
        decision: 'minor_revisions',
        comments: 'The paper has potential but requires more details on methodology and additional benchmarking.',
        privateComments: 'Paper should be accepted after addressing the suggested revisions.',
        submittedDate: '2023-03-15T13:10:00Z',
        dueDate: '2023-03-20T00:00:00Z',
        criteria: {
          methodology: 3,
          relevance: 4,
          clarity: 3,
          originality: 4,
          overall: 3.5,
        },
      }
    ],
    decision: {
      status: 'revision',
      comments: 'Please address the reviewer comments regarding methodology and provide additional benchmarking data.',
      date: '2023-04-01T10:45:00Z',
    },
  },
  {
    id: 'sub-5',
    title: 'Sustainable Energy Systems for Smart Cities',
    abstract: 'This paper proposes innovative approaches to integrating renewable energy sources in urban environments to create more sustainable smart cities.',
    authors: ['Environmental Engineer Jones', 'Author Davis'],
    keywords: ['renewable energy', 'smart cities', 'sustainability', 'urban planning'],
    status: 'accepted',
    submittedDate: '2023-03-01T09:15:00Z',
    updatedDate: '2023-05-10T16:30:00Z',
    document: 'https://example.com/documents/sustainable_energy_paper.pdf',
    coverLetter: 'Our research addresses the critical need for sustainable energy solutions in urban environments...',
    correspondingAuthor: 'user-4',
    reviewers: ['user-3'],
    editorId: 'user-2',
    category: 'Environmental Engineering',
    reviews: [
      {
        id: 'rev-4',
        submissionId: 'sub-5',
        reviewerId: 'user-3',
        completed: true,
        decision: 'accept',
        comments: 'Excellent research with significant practical implications for urban planning.',
        privateComments: 'Highly recommend publication.',
        submittedDate: '2023-04-20T11:25:00Z',
        dueDate: '2023-04-25T00:00:00Z',
        criteria: {
          methodology: 5,
          relevance: 5,
          clarity: 4,
          originality: 4,
          overall: 4.5,
        },
      }
    ],
    decision: {
      status: 'accept',
      comments: 'We are pleased to accept your paper for publication. Your research on sustainable energy systems is timely and valuable.',
      date: '2023-05-05T14:10:00Z',
    },
  },
  {
    id: 'sub-6',
    title: 'Cybersecurity in Internet of Things Devices',
    abstract: 'This study examines security vulnerabilities in IoT devices and proposes a framework for comprehensive security assessment and protection.',
    authors: ['Security Researcher White', 'Author Davis'],
    keywords: ['cybersecurity', 'IoT', 'network security', 'vulnerability assessment'],
    status: 'rejected',
    submittedDate: '2023-01-25T10:40:00Z',
    updatedDate: '2023-03-05T15:50:00Z',
    document: 'https://example.com/documents/iot_security_paper.pdf',
    coverLetter: 'We present findings from our extensive research on IoT security vulnerabilities...',
    correspondingAuthor: 'user-4',
    reviewers: ['user-3'],
    editorId: 'user-2',
    category: 'Cybersecurity',
    reviews: [
      {
        id: 'rev-5',
        submissionId: 'sub-6',
        reviewerId: 'user-3',
        completed: true,
        decision: 'reject',
        comments: 'The paper lacks novelty and does not adequately address existing literature in the field.',
        privateComments: 'Similar work has already been published. Recommend rejection.',
        submittedDate: '2023-02-25T09:30:00Z',
        dueDate: '2023-03-01T00:00:00Z',
        criteria: {
          methodology: 2,
          relevance: 3,
          clarity: 2,
          originality: 1,
          overall: 2,
        },
      }
    ],
    decision: {
      status: 'reject',
      comments: 'After careful consideration of the reviews, we cannot accept this paper for publication as it does not provide sufficient novel contributions to the field.',
      date: '2023-03-05T10:15:00Z',
    },
  },
  {
    id: 'sub-7',
    title: 'Ethics of Artificial Intelligence in Healthcare Decision-Making',
    abstract: 'This paper explores ethical considerations in the application of artificial intelligence for healthcare decision-making processes.',
    authors: ['Ethics Researcher Green', 'Medical Doctor Taylor', 'Author Davis'],
    keywords: ['AI ethics', 'healthcare', 'decision-making', 'medical ethics'],
    status: 'draft',
    submittedDate: '2023-05-25T13:20:00Z',
    updatedDate: '2023-05-25T13:20:00Z',
    document: 'https://example.com/documents/ai_ethics_draft.pdf',
    coverLetter: 'Draft letter discussing ethical implications of AI in healthcare...',
    correspondingAuthor: 'user-4',
    category: 'Medical Ethics',
  },
];

// Mock Dashboard Stats
export const dashboardStats: DashboardStats = {
  totalSubmissions: submissions.length,
  pendingReviews: submissions.filter(s => s.status === 'under_review').length,
  acceptedSubmissions: submissions.filter(s => s.status === 'accepted').length,
  rejectedSubmissions: submissions.filter(s => s.status === 'rejected').length,
  underReviewSubmissions: submissions.filter(s => s.status === 'under_review').length,
  publishedArticles: submissions.filter(s => s.status === 'published').length,
  submissionTrends: [
    { month: 'Jan', submissions: 7 },
    { month: 'Feb', submissions: 5 },
    { month: 'Mar', submissions: 9 },
    { month: 'Apr', submissions: 12 },
    { month: 'May', submissions: 8 },
    { month: 'Jun', submissions: 10 }
  ],
  decisionRates: [
    { status: 'Accepted', count: 12 },
    { status: 'Rejected', count: 5 },
    { status: 'Revision Required', count: 8 }
  ],
  reviewTimes: [
    { month: 'Jan', days: 21 },
    { month: 'Feb', days: 18 },
    { month: 'Mar', days: 15 },
    { month: 'Apr', days: 17 },
    { month: 'May', days: 14 },
    { month: 'Jun', days: 16 }
  ]
};
