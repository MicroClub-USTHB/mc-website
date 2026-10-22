import { MenuBar } from "@/components/site-menu/menu-bar"
import { MenuProvider } from "@/components/site-menu/menu-context"
import { MenuLink } from "@/components/site-menu/menu-link"
import { MenuPanel } from "@/components/site-menu/menu-panel"
import { PageWordmark } from "@/components/site-menu/page-wordmark"
import { RegistrationsDock } from "@/components/site-menu/registrations-dock"
import { menuLinks, siteConfig } from "@/config/site"

/**
 * Site header with the hamburger menu (Figma "Menu Bar"), like wondermake.xyz:
 * - a "MICRO CLUB" wordmark sits in the page next to the toggle and scrolls away with it,
 * - the hero's registrations button docks at the other end of the bar once scrolled up there,
 * - once it has passed the toggle, a compact MC mark slides out from behind the fixed toggle,
 * - the toggle opens a full-screen panel of section links that wipes in from the left.
 *
 * Server Component: the header, home links and navigation are in the server-rendered HTML;
 * only state and animations live in the client islands.
 */
export function SiteMenu() {
  const homeLabel = `${siteConfig.name} home`

  return (
    <MenuProvider>
      <PageWordmark label={homeLabel} />
      <RegistrationsDock />
      <MenuBar homeLabel={homeLabel} />
      <MenuPanel>
        <ul className="mx-auto max-w-site px-(--menu-left) pt-[calc(var(--menu-top)+var(--menu-size))] pb-8">
          {menuLinks.map((link) => (
            <li key={link.id}>
              <MenuLink sectionId={link.id}>{link.label}</MenuLink>
            </li>
          ))}
        </ul>
      </MenuPanel>
    </MenuProvider>
  )
}
