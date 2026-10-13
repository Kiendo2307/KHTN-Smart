import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ComparisonSetupView } from './components/ComparisonSetupView';
import { ReviewResultsView } from './components/ReviewResultsView';
import { HistoryView } from './components/HistoryView';
import { CriteriaSettingsView } from './components/CriteriaSettingsView';
import { ReviewSession, Criterion, SubjectField } from './types';
import { DEFAULT_CRITERIA } from './data/defaultCriteria';
import { SAMPLE_BUNDLES, SampleBundle } from './data/sampleDocs';
import { checkServerStatus } from './services/api';

const STORAGE_KEY_SESSIONS = 'khtn_smart_review_sessions_v1';
const STORAGE_KEY_CRITERIA = 'khtn_smart_review_criteria_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [setupInitialSubject, setSetupInitialSubject] = useState<SubjectField>('Hóa học');

  // Server & AI status
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  const [isServerReady, setIsServerReady] = useState<boolean>(false);

  // Criteria State
  const [criteria, setCriteria] = useState<Criterion[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CRITERIA);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading criteria from storage:', e);
    }
    return DEFAULT_CRITERIA;
  });

  // Sessions History State
  const [sessions, setSessions] = useState<ReviewSession[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading sessions from storage:', e);
    }

    // Default pre-loaded session using sample 1 (KHTN 8 Hóa học)
    const initialSample = SAMPLE_BUNDLES[0];
    const defaultSession: ReviewSession = {
      id: 'session-default-khtn8',
      title: 'Đợt rà soát mẫu: KHTN 8 (Hóa học) – Phản ứng hóa học',
      createdAt: new Date().toISOString(),
      subject: initialSample.subject,
      grade: initialSample.grade,
      scope: initialSample.scope,
      documents: [
        {
          id: 'doc-pl-default',
          name: initialSample.phuLucDoc.name,
          type: 'Phụ lục',
          wordCount: 385,
        },
        {
          id: 'doc-syl-default',
          name: initialSample.syllabusDoc.name,
          type: 'Syllabus',
          wordCount: 290,
        },
      ],
      criteriaApplied: [
        'Thời lượng & Phân bổ số tiết',
        'Nội dung thực hành & Thí nghiệm hóa chất',
        'Kiến thức và phương trình hóa học',
        'Tính thống nhất về nội dung',
        'Tính toán, số liệu và an toàn phòng thí nghiệm',
      ],
      summaryOverview: initialSample.sampleResults.summaryOverview,
      counts: {
        total: initialSample.sampleResults.items.length,
        phuHop: initialSample.sampleResults.items.filter((i) => i.resultStatus === 'Phù hợp').length,
        canKiemTra: initialSample.sampleResults.items.filter((i) => i.resultStatus === 'Cần kiểm tra').length,
        chuaTimThay: initialSample.sampleResults.items.filter((i) => i.resultStatus === 'Chưa tìm thấy căn cứ').length,
        chuaDuDuLieu: initialSample.sampleResults.items.filter((i) => i.resultStatus === 'Chưa đủ dữ liệu').length,
        teacherConfirmed: 2,
      },
      items: initialSample.sampleResults.items.map((it, idx) => {
        if (idx === 0) {
          return {
            ...it,
            teacherVerification: {
              status: 'Đã xác nhận',
              decision: 'confirmed',
              notes: 'Đã làm việc với giáo viên Hóa để điều chỉnh tăng 2 tiết vào tuần sau.',
              proposedAdjustment: 'Cập nhật Syllabus lên 10 tiết.',
              updatedAt: new Date().toISOString(),
            },
          };
        }
        if (idx === 2) {
          return {
            ...it,
            teacherVerification: {
              status: 'Đã xác nhận',
              decision: 'confirmed',
              notes: 'Yêu cầu GV thay lại tên Barium chloride trên tất cả phiếu bài tập.',
              proposedAdjustment: 'Đổi sang danh pháp IUPAC chuẩn 2018.',
              updatedAt: new Date().toISOString(),
            },
          };
        }
        return it;
      }),
      isDemo: true,
      teacherAuthor: 'Tổ trưởng Chuyên môn KHTN',
    };

    return [defaultSession];
  });

  // Active Session
  const [activeSession, setActiveSession] = useState<ReviewSession | null>(() => {
    return sessions.length > 0 ? sessions[0] : null;
  });

  // Check server status on mount
  useEffect(() => {
    checkServerStatus()
      .then((res) => {
        setIsServerReady(true);
        setHasApiKey(res.hasApiKey ?? false);
      })
      .catch((err) => {
        console.error('Server status check error:', err);
        setIsServerReady(true);
      });
  }, []);

  // Sync criteria to localStorage
  const handleUpdateCriteria = (updated: Criterion[]) => {
    setCriteria(updated);
    try {
      localStorage.setItem(STORAGE_KEY_CRITERIA, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving criteria:', e);
    }
  };

  const handleResetCriteriaDefaults = () => {
    setCriteria(DEFAULT_CRITERIA);
    try {
      localStorage.setItem(STORAGE_KEY_CRITERIA, JSON.stringify(DEFAULT_CRITERIA));
    } catch (e) {
      console.error('Error resetting criteria:', e);
    }
  };

  // Sync sessions to localStorage
  const saveSessions = (newSessions: ReviewSession[]) => {
    setSessions(newSessions);
    try {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(newSessions));
    } catch (e) {
      console.error('Error saving sessions:', e);
    }
  };

  const handleReviewCompleted = (newSession: ReviewSession) => {
    const updated = [newSession, ...sessions.filter((s) => s.id !== newSession.id)];
    saveSessions(updated);
    setActiveSession(newSession);
    setActiveTab('results');
  };

  const handleUpdateSession = (updatedSession: ReviewSession) => {
    const updated = sessions.map((s) => (s.id === updatedSession.id ? updatedSession : s));
    saveSessions(updated);
    setActiveSession(updatedSession);
  };

  const handleDeleteSession = (sessionId: string) => {
    const updated = sessions.filter((s) => s.id !== sessionId);
    saveSessions(updated);
    if (activeSession?.id === sessionId) {
      setActiveSession(updated.length > 0 ? updated[0] : null);
    }
  };

  const handleSelectSession = (session: ReviewSession) => {
    setActiveSession(session);
    setActiveTab('results');
  };

  const handleStartNewReview = (subject?: SubjectField) => {
    if (subject) {
      setSetupInitialSubject(subject);
    }
    setActiveTab('compare');
  };

  const handleLoadSampleFromDashboard = (sample: SampleBundle) => {
    // Find or create session from sample
    const existing = sessions.find((s) => s.title.includes(sample.title));
    if (existing) {
      setActiveSession(existing);
      setActiveTab('results');
    } else {
      const sampleSession: ReviewSession = {
        id: `sample-session-${sample.id}`,
        title: `Đợt rà soát mẫu: ${sample.title}`,
        createdAt: new Date().toISOString(),
        subject: sample.subject,
        grade: sample.grade,
        scope: sample.scope,
        documents: [
          {
            id: `doc-${sample.id}-pl`,
            name: sample.phuLucDoc.name,
            type: 'Phụ lục',
            wordCount: sample.phuLucDoc.content.trim().split(/\s+/).length,
          },
          {
            id: `doc-${sample.id}-syl`,
            name: sample.syllabusDoc.name,
            type: 'Syllabus',
            wordCount: sample.syllabusDoc.content.trim().split(/\s+/).length,
          },
        ],
        criteriaApplied: sample.sampleResults.items.map((i) => i.criterion),
        summaryOverview: sample.sampleResults.summaryOverview,
        counts: {
          total: sample.sampleResults.items.length,
          phuHop: sample.sampleResults.items.filter((i) => i.resultStatus === 'Phù hợp').length,
          canKiemTra: sample.sampleResults.items.filter((i) => i.resultStatus === 'Cần kiểm tra').length,
          chuaTimThay: sample.sampleResults.items.filter((i) => i.resultStatus === 'Chưa tìm thấy căn cứ').length,
          chuaDuDuLieu: sample.sampleResults.items.filter((i) => i.resultStatus === 'Chưa đủ dữ liệu').length,
          teacherConfirmed: 0,
        },
        items: sample.sampleResults.items,
        isDemo: true,
        teacherAuthor: 'Tổ KHTN',
      };
      saveSessions([sampleSession, ...sessions]);
      setActiveSession(sampleSession);
      setActiveTab('results');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Top Header */}
      <Header
        hasApiKey={hasApiKey}
        activeTab={activeTab}
        onNavigate={(tab) => setActiveTab(tab)}
      />

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        {/* Left Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            if (tab === 'results' && !activeSession) {
              setActiveTab('compare');
            } else {
              setActiveTab(tab);
            }
          }}
          hasActiveResults={!!activeSession}
          historyCount={sessions.length}
        />

        {/* Central Workspace Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              sessions={sessions}
              activeSession={activeSession}
              onSelectSession={handleSelectSession}
              onStartNewReview={handleStartNewReview}
              onLoadSample={handleLoadSampleFromDashboard}
            />
          )}

          {activeTab === 'compare' && (
            <ComparisonSetupView
              allCriteria={criteria}
              hasApiKey={hasApiKey}
              onReviewCompleted={handleReviewCompleted}
              initialSubject={setupInitialSubject}
            />
          )}

          {activeTab === 'results' && activeSession && (
            <ReviewResultsView
              session={activeSession}
              onUpdateSession={handleUpdateSession}
              onReopenSetup={() => setActiveTab('compare')}
            />
          )}

          {activeTab === 'history' && (
            <HistoryView
              sessions={sessions}
              activeSessionId={activeSession?.id}
              onSelectSession={handleSelectSession}
              onDeleteSession={handleDeleteSession}
              onStartNewReview={() => handleStartNewReview()}
            />
          )}

          {activeTab === 'criteria' && (
            <CriteriaSettingsView
              criteria={criteria}
              onUpdateCriteria={handleUpdateCriteria}
              onResetDefaults={handleResetCriteriaDefaults}
            />
          )}
        </main>
      </div>
    </div>
  );
}
