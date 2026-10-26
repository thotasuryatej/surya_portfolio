import { useState } from 'react';
import { Activity, Camera, Film, ListChecks, ScanFace, ScanSearch } from 'lucide-react';

const STAGES = [
  { id: 'feed', title: 'Camera feeds', icon: Camera, parts: 'Webcam · CCTV', text: 'Live video comes in from webcams and CCTV cameras.' },
  { id: 'frames', title: 'Frame processing', icon: Film, parts: 'Python · OpenCV', text: 'OpenCV reads the stream frame by frame and prepares each frame for analysis.' },
  { id: 'motion', title: 'Motion detection', icon: Activity, parts: 'OpenCV', text: 'Changes between frames show where something is moving, so attention goes only where something is happening.' },
  { id: 'objects', title: 'Object detection', icon: ScanSearch, parts: 'YOLO · multiple datasets', text: 'YOLO finds and labels objects in the frame in real time.' },
  { id: 'faces', title: 'Face recognition', icon: ScanFace, parts: 'Computer vision', text: 'Faces in the frame are detected and recognised.' },
  { id: 'events', title: 'Event tracking', icon: ListChecks, parts: 'Monitoring interface', text: 'Detections become events in a monitoring interface that visualises them and tracks what happened.' },
] as const;

/**
 * The detection workflow on a synthetic scene: each stage adds its layer to the frame, so the overlays build up
 * the way the pipeline does. No real footage, and no confidence scores — the project published none.
 */
export function VisionPipeline() {
  const [step, setStep] = useState(3);
  const stage = STAGES[step];
  const on = (id: (typeof STAGES)[number]['id']) => STAGES.findIndex((s) => s.id === id) <= step;

  return (
    <div className="dg">
      <ol className="vp-steps" role="list" aria-label="Detection workflow">
        {STAGES.map((s, i) => (
          <li key={s.id}>
            <button type="button" className="vp-step" aria-pressed={i === step} data-done={i < step || undefined} onClick={() => setStep(i)}>
              <s.icon size={16} strokeWidth={1.75} aria-hidden="true" />
              <span>{s.title}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="vp-frame">
        <svg viewBox="0 0 320 180" role="img" aria-label={`Synthetic camera frame showing the layers up to ${stage.title.toLowerCase()}`}>
          {/* scene */}
          <rect width="320" height="180" className="vp-bg" />
          <path className="vp-scene" d="M0 140H320M40 140V58H104V140M200 140L230 96H300" />
          <g className={on('frames') ? 'vp-ghosts is-on' : 'vp-ghosts'}>
            <g transform="translate(-26 0)" opacity=".25">
              <circle cx="170" cy="70" r="10" />
              <rect x="157" y="84" width="26" height="44" rx="10" />
            </g>
            <g transform="translate(-13 0)" opacity=".45">
              <circle cx="170" cy="70" r="10" />
              <rect x="157" y="84" width="26" height="44" rx="10" />
            </g>
          </g>
          <g className="vp-person">
            <circle cx="170" cy="70" r="10" />
            <rect x="157" y="84" width="26" height="44" rx="10" />
            <path d="M162 128V140M178 128V140" />
          </g>
          <rect className="vp-object" x="250" y="118" width="30" height="22" rx="3" />

          {/* stage overlays */}
          {on('frames') && (
            <g className="vp-layer">
              <path className="vp-grid" d="M0 45H320M0 90H320M0 135H320M80 0V180M160 0V180M240 0V180" />
            </g>
          )}
          {on('motion') && (
            <g className="vp-layer">
              <rect className="vp-motion" x="128" y="56" width="58" height="88" rx="6" />
              <text className="vp-tag vp-tag--motion" x="130" y="51">
                motion
              </text>
            </g>
          )}
          {on('objects') && (
            <g className="vp-layer">
              <rect className="vp-box" x="152" y="56" width="36" height="88" />
              <text className="vp-tag" x="152" y="51">
                person
              </text>
              <rect className="vp-box" x="246" y="114" width="38" height="30" />
              <text className="vp-tag" x="246" y="109">
                object
              </text>
            </g>
          )}
          {on('faces') && (
            <g className="vp-layer">
              <rect className="vp-face" x="158" y="58" width="24" height="24" />
              <text className="vp-tag vp-tag--face" x="188" y="66">
                face
              </text>
            </g>
          )}
          {on('events') && (
            <g className="vp-layer">
              <rect className="vp-bar" x="8" y="152" width="304" height="20" rx="5" />
              {[
                [24, 'motion'],
                [118, 'person'],
                [212, 'face'],
              ].map(([x, t]) => (
                <g key={t}>
                  <circle className="vp-evt" cx={Number(x)} cy="162" r="3" />
                  <text className="vp-evt-t" x={Number(x) + 8} y="165.5">
                    {t} detected
                  </text>
                </g>
              ))}
            </g>
          )}
          <text className="vp-cam" x="10" y="18">
            CAM · LIVE
          </text>
          <circle className="vp-rec" cx="302" cy="14" r="4" />
        </svg>
      </div>

      <div className="dg-detail" aria-live="polite">
        <strong>
          {step + 1}. {stage.title}
        </strong>
        <span className="dg-parts">{stage.parts}</span>
        <p>{stage.text}</p>
      </div>
      <p className="dg-note">Synthetic scene for illustration. No real surveillance footage is published.</p>
    </div>
  );
}
