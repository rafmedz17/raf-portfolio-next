// Site content lives in content.json — edit it from the admin page at /admin
// (or by hand). This file just re-exports it for convenience.
import content from "./content.json";

export default content;
export const { profile, socials, about, stack, projects, experience } = content;
export { navLinks } from "./nav";
