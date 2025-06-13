

const BUILD_VERSION = "2025-06-13"

export function AboutSidePanel ()
{
    return <div>
        <span className="description_label">Version</span> <b>{BUILD_VERSION}</b>
    </div>
}
