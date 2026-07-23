import { LogoMark } from './Icons'

// The "LOGO" frame in Figma (node 2191:10397) is a single flattened image
// of the pin-shaped volleyball mark + "VOLLEYBALL HUB" wordmark. We already
// rebuilt that same mark as a faithful vector (verified against the brand
// reference image Russell supplied) for the header logo elsewhere in the
// app, so it's reused here as vector + real text rather than fetching a
// second, separate raster copy of the identical artwork.
export default function VolleyballIllustration() {
  return (
    <div className="lang-logo">
      <LogoMark width={92} height={120} />
      <div className="wordmark">
        <div>Volleyball</div>
        <div>Hub</div>
      </div>
    </div>
  )
}
