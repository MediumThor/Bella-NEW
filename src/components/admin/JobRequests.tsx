import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import './JobRequests.css';

interface JobRequest {
  id: string;
  jobName: string;
  location: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  sinkModel: string;
  numberOfHoles: number;
  holePositions: number[];
  stoneSelection: string;
  numberOfVanities: string;
  otherInfo: string;
  drawingUrls: string[];
  status: string;
  createdAt: any;
}

const JobRequests = () => {
  const [jobRequests, setJobRequests] = useState<JobRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchJobRequests();
  }, [filterStatus]);

  const fetchJobRequests = async () => {
    try {
      const requestsRef = collection(db, 'jobRequests');
      let requestsQuery;
      
      if (filterStatus === 'all') {
        requestsQuery = query(requestsRef, orderBy('createdAt', 'desc'));
      } else {
        requestsQuery = query(requestsRef, orderBy('createdAt', 'desc'));
      }
      
      const snapshot = await getDocs(requestsQuery);
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as JobRequest[];

      const filtered = filterStatus === 'all' 
        ? requests 
        : requests.filter(req => req.status === filterStatus);
      
      setJobRequests(filtered);
    } catch (error) {
      console.error('Error fetching job requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'jobRequests', id), {
        status: newStatus,
        updatedAt: new Date()
      });
      fetchJobRequests();
    } catch (error) {
      console.error('Error updating job request status:', error);
      alert('Failed to update status');
    }
  };

  const deleteJobRequest = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job request?')) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'jobRequests', id));
      fetchJobRequests();
      if (selectedJob?.id === id) {
        setSelectedJob(null);
      }
    } catch (error) {
      console.error('Error deleting job request:', error);
      alert('Failed to delete job request');
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="loading">Loading job requests...</div>;
  }

  return (
    <div className="job-requests">
      <div className="job-requests-header">
        <h2>Job Requests</h2>
        <div className="status-filter">
          <button
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filterStatus === 'new' ? 'active' : ''}`}
            onClick={() => setFilterStatus('new')}
          >
            New
          </button>
          <button
            className={`filter-btn ${filterStatus === 'in-progress' ? 'active' : ''}`}
            onClick={() => setFilterStatus('in-progress')}
          >
            In Progress
          </button>
          <button
            className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
            onClick={() => setFilterStatus('completed')}
          >
            Completed
          </button>
        </div>
      </div>

      {jobRequests.length === 0 ? (
        <div className="empty-state">
          <p>No job requests found.</p>
        </div>
      ) : (
        <div className="job-requests-container">
          <div className="job-requests-list">
            {jobRequests.map((job) => (
              <div
                key={job.id}
                className={`job-request-card ${selectedJob?.id === job.id ? 'selected' : ''} status-${job.status}`}
                onClick={() => setSelectedJob(job)}
              >
                <div className="job-card-header">
                  <h3>{job.jobName || 'Unnamed Job'}</h3>
                  <span className={`status-badge status-${job.status}`}>
                    {job.status || 'new'}
                  </span>
                </div>
                <div className="job-card-info">
                  <p><strong>Customer:</strong> {job.customerName}</p>
                  <p><strong>Location:</strong> {job.location}</p>
                  <p><strong>Stone:</strong> {job.stoneSelection}</p>
                  <p><strong>Created:</strong> {formatDate(job.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>

          {selectedJob && (
            <div className="job-request-detail">
              <div className="detail-header">
                <h3>{selectedJob.jobName}</h3>
                <button className="close-detail" onClick={() => setSelectedJob(null)}>×</button>
              </div>

              <div className="detail-content">
                <div className="detail-section">
                  <h4>Job Information</h4>
                  <div className="detail-grid">
                    <div><strong>Job Name:</strong> {selectedJob.jobName}</div>
                    <div><strong>Location:</strong> {selectedJob.location}</div>
                    <div><strong>Status:</strong> 
                      <select
                        value={selectedJob.status || 'new'}
                        onChange={(e) => updateStatus(selectedJob.id, e.target.value)}
                        className="status-select"
                      >
                        <option value="new">New</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Customer Information</h4>
                  <div className="detail-grid">
                    <div><strong>Name:</strong> {selectedJob.customerName}</div>
                    <div><strong>Email:</strong> <a href={`mailto:${selectedJob.customerEmail}`}>{selectedJob.customerEmail}</a></div>
                    <div><strong>Phone:</strong> <a href={`tel:${selectedJob.customerPhone}`}>{selectedJob.customerPhone}</a></div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Sink Details</h4>
                  <div className="detail-grid">
                    <div><strong>Sink Model:</strong> {selectedJob.sinkModel}</div>
                    <div><strong>Number of Holes:</strong> {selectedJob.numberOfHoles}</div>
                    {selectedJob.holePositions && selectedJob.holePositions.length > 0 && (
                      <div><strong>Hole Positions:</strong> {selectedJob.holePositions.join('", ')}"</div>
                    )}
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Material & Quantity</h4>
                  <div className="detail-grid">
                    <div><strong>Stone Selection:</strong> {selectedJob.stoneSelection}</div>
                    <div><strong>Number of Vanities:</strong> {selectedJob.numberOfVanities || 'N/A'}</div>
                  </div>
                </div>

                {selectedJob.otherInfo && (
                  <div className="detail-section">
                    <h4>Additional Information</h4>
                    <p className="other-info">{selectedJob.otherInfo}</p>
                  </div>
                )}

                {selectedJob.drawingUrls && selectedJob.drawingUrls.length > 0 && (
                  <div className="detail-section">
                    <h4>Drawings ({selectedJob.drawingUrls.length})</h4>
                    <div className="drawings-grid">
                      {selectedJob.drawingUrls.map((url, index) => (
                        <div key={index} className="drawing-item">
                          <img
                            src={url}
                            alt={`Drawing ${index + 1}`}
                            onClick={() => window.open(url, '_blank')}
                            className="drawing-thumbnail"
                          />
                          <a href={url} target="_blank" rel="noopener noreferrer" className="drawing-link">
                            View Full Size
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="detail-actions">
                  <button
                    className="btn-delete"
                    onClick={() => deleteJobRequest(selectedJob.id)}
                  >
                    Delete Job Request
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobRequests;

