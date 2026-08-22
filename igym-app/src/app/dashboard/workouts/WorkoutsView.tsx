'use client'

import { useState } from 'react'

export interface WorkoutVideo {
  id: string
  title: string
  coachName: string
  coachTitle: string
  duration: string
  level: string
  category: 'HIIT' | 'Strength' | 'Yoga' | 'Cardio' | 'Mobility'
  thumbnailUrl: string
  views: string
}

const MOCK_VIDEOS: WorkoutVideo[] = [
  {
    id: 'v1',
    title: 'Full Body Fat Burner HIIT',
    coachName: 'Coach Alex Rivera',
    coachTitle: 'Head Strength Trainer',
    duration: '25 mins',
    level: 'Intermediate',
    category: 'HIIT',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
    views: '1.4k views',
  },
  {
    id: 'v2',
    title: 'Beginner Dumbbell Strength & Form',
    coachName: 'Coach Alex Rivera',
    coachTitle: 'Head Strength Trainer',
    duration: '18 mins',
    level: 'Beginner',
    category: 'Strength',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80',
    views: '980 views',
  },
  {
    id: 'v3',
    title: 'Morning Mobility & Flex Yoga Flow',
    coachName: 'Elena Rostova',
    coachTitle: 'Conditioning Specialist',
    duration: '15 mins',
    level: 'All Levels',
    category: 'Yoga',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80',
    views: '2.1k views',
  },
  {
    id: 'v4',
    title: 'Unbreakable Core & Abs Circuit',
    coachName: 'Marcus Vance',
    coachTitle: 'Mobility & Rehab Expert',
    duration: '12 mins',
    level: 'Advanced',
    category: 'Strength',
    thumbnailUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=80',
    views: '3.2k views',
  },
  {
    id: 'v5',
    title: 'High-Energy Cardio Kickboxing Routine',
    coachName: 'Sarah Chen',
    coachTitle: 'Endurance Specialist',
    duration: '30 mins',
    level: 'Intermediate',
    category: 'Cardio',
    thumbnailUrl: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&auto=format&fit=crop&q=80',
    views: '850 views',
  },
  {
    id: 'v6',
    title: 'Lower Body & Glute Hypertrophy',
    coachName: 'Coach Alex Rivera',
    coachTitle: 'Head Strength Trainer',
    duration: '35 mins',
    level: 'Intermediate',
    category: 'Strength',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
    views: '4.5k views',
  },
]

export default function WorkoutsView() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [activeVideo, setActiveVideo] = useState<WorkoutVideo | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const categories = ['All', 'HIIT', 'Strength', 'Cardio', 'Yoga', 'Mobility']

  const filteredVideos =
    selectedCategory === 'All'
      ? MOCK_VIDEOS
      : MOCK_VIDEOS.filter((v) => v.category === selectedCategory)

  const handleOpenVideo = (video: WorkoutVideo) => {
    setActiveVideo(video)
  }

  const handleMarkCompleted = () => {
    setToastMessage(`Great job! Workout "${activeVideo?.title}" recorded to your history! 💪`)
    setActiveVideo(null)
    setTimeout(() => {
      setToastMessage(null)
    }, 4000)
  }

  return (
    <div className="vids-root">
      {/* ── Toast ──────────────────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="vids-toast" role="alert">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="vids-head-row">
        <h1 className="vids-title">Video Workouts &amp; Tutorials</h1>
        <p className="vids-sub">
          On-demand fitness classes and exercise form guides led by certified iGYM trainers.
        </p>
      </div>

      {/* ── Scrollable Category Filters ───────────────────────────────────── */}
      <div className="vids-filters" role="tablist">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`vids-filter-chip ${
              selectedCategory === cat ? 'vids-filter-chip--active' : ''
            }`}
            onClick={() => setSelectedCategory(cat)}
            role="tab"
            aria-selected={selectedCategory === cat}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Responsive Video Grid ─────────────────────────────────────────── */}
      <div className="vids-grid">
        {filteredVideos.map((video) => (
          <article
            key={video.id}
            className="vids-card"
            onClick={() => handleOpenVideo(video)}
          >
            {/* Thumbnail Box */}
            <div className="vids-thumb-box">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="vids-thumb-img"
                loading="lazy"
              />

              {/* Play Overlay Icon */}
              <div className="vids-play-overlay">
                <span className="vids-play-btn" aria-label="Play video">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </span>
              </div>

              {/* Duration Badge */}
              <span className="vids-duration-badge">{video.duration}</span>
            </div>

            {/* Content Details */}
            <div className="vids-card-body">
              <div className="vids-card-tags">
                <span className="vids-cat-chip">{video.category}</span>
                <span className="vids-level-chip">{video.level}</span>
              </div>
              <h2 className="vids-card-title">{video.title}</h2>
              <div className="vids-card-footer">
                <p className="vids-coach">{video.coachName}</p>
                <p className="vids-views">{video.views}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* ── Video Player Modal Demo ────────────────────────────────────────── */}
      {activeVideo && (
        <div className="vids-modal-backdrop" onClick={() => setActiveVideo(null)}>
          <div className="vids-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="vids-modal-header">
              <div>
                <span className="vids-modal-cat">{activeVideo.category} &bull; {activeVideo.duration}</span>
                <h3 className="vids-modal-title">{activeVideo.title}</h3>
              </div>
              <button
                type="button"
                className="vids-modal-close"
                onClick={() => setActiveVideo(null)}
                aria-label="Close modal"
              >
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Video Player Display Container */}
            <div className="vids-player-wrapper">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeVideo.thumbnailUrl}
                alt="Video stream preview"
                className="vids-player-poster"
              />
              <div className="vids-player-overlay">
                <span className="vids-modal-play-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </span>
                <p className="vids-player-status">Streaming Video HD &bull; {activeVideo.coachName}</p>
              </div>
            </div>

            <div className="vids-modal-footer">
              <div>
                <p className="vids-modal-coach-name">{activeVideo.coachName}</p>
                <p className="vids-modal-coach-sub">{activeVideo.coachTitle}</p>
              </div>
              <button
                type="button"
                className="vids-modal-done-btn"
                onClick={handleMarkCompleted}
              >
                Mark Workout Completed
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="dash-bottom-spacer" />
    </div>
  )
}
