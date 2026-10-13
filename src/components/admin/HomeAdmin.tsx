"use client";

import { ArrowDown, ArrowUp, Megaphone, Pencil, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { HeroSlideView } from "@/components/store/HeroSlider";
import { Button } from "@/components/ui/Button";
import { Badge, PageHeader } from "@/components/ui/Display";
import { ConfirmDialog, Dialog } from "@/components/ui/Dialog";
import { fieldDescribedBy, FormField, Input, Select, Switch, Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/format";
import { newId } from "@/lib/ids";
import { PHOTO_KEYS, PHOTOS } from "@/lib/photos";
import type { Announcement, HeroSlide } from "@/lib/types";
import { MAX_SLIDES, validateAnnouncement, validateHeroSlide, validateHeroSlides, type FieldErrors } from "@/lib/validation";
import { catalogActions, useCatalog } from "@/state/catalog-store";
import { Panel } from "./AdminUi";

const TONE_OPTIONS = [
  { value: "dark", label: "Koyu" },
  { value: "accent", label: "Mavi" },
  { value: "light", label: "Açık" },
];

const emptySlide = (): HeroSlide => ({
  id: newId("slide"),
  title: "",
  subtitle: "",
  ctaLabel: "",
  ctaHref: "",
  photo: PHOTO_KEYS[0],
  tone: "dark",
  status: "draft",
});

export function HomeAdmin() {
  const { heroSlides, announcement } = useCatalog();
  const toast = useToast();
  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<HeroSlide | null>(null);

  /** Saves a whole list after the list-level limits pass. */
  const saveList = (list: HeroSlide[], message?: string) => {
    const error = validateHeroSlides(list);
    if (error) {
      toast.show(error, "error");
      return false;
    }
    catalogActions.saveHeroSlides(list);
    if (message) toast.show(message);
    return true;
  };

  const move = (index: number, delta: number) => {
    const list = [...heroSlides];
    const [item] = list.splice(index, 1);
    list.splice(index + delta, 0, item);
    saveList(list);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ana sayfa vitrini"
        description="Mağaza ana sayfasındaki slaytları ve header üstündeki kampanya şeridini düzenle. Değişiklikler yalnızca bu tarayıcıdaki demo verisine kaydedilir."
      />

      <Panel
        title="Slaytlar"
        description={`En fazla ${MAX_SLIDES} slayt; aynı anda en fazla 4 tanesi yayında olabilir. Bağlantılar site içi olmalıdır.`}
        actions={
          <Button
            size="sm"
            disabled={heroSlides.length >= MAX_SLIDES}
            onClick={() => {
              setIsNew(true);
              setEditing(emptySlide());
            }}
          >
            <Plus className="size-4" aria-hidden="true" />
            Yeni slayt
          </Button>
        }
      >
        {heroSlides.length === 0 ? (
          <p className="text-sm text-muted">Henüz slayt yok. Yayında slayt olmadığında ana sayfa sade arama alanıyla açılır.</p>
        ) : (
          <ul className="-my-2 divide-y divide-line">
            {heroSlides.map((slide, i) => (
              <li key={slide.id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="h-14 w-24 shrink-0 overflow-hidden rounded-md" aria-hidden="true">
                  <HeroSlideView slide={{ ...slide, subtitle: "", ctaLabel: "", title: "" }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{slide.title}</p>
                  <p className="truncate text-xs text-muted">{slide.ctaHref || "Butonsuz"}</p>
                </div>
                <Badge tone={slide.status === "published" ? "success" : "neutral"}>{slide.status === "published" ? "Yayında" : "Taslak"}</Badge>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" aria-label={`Yukarı taşı: ${slide.title}`} disabled={i === 0} onClick={() => move(i, -1)}>
                    <ArrowUp className="size-4" aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Aşağı taşı: ${slide.title}`}
                    disabled={i === heroSlides.length - 1}
                    onClick={() => move(i, 1)}
                  >
                    <ArrowDown className="size-4" aria-hidden="true" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    aria-label={`Düzenle: ${slide.title}`}
                    onClick={() => {
                      setIsNew(false);
                      setEditing(slide);
                    }}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                    Düzenle
                  </Button>
                  <Button variant="ghost" size="sm" aria-label={`Sil: ${slide.title}`} onClick={() => setPendingDelete(slide)}>
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <AnnouncementForm key={JSON.stringify(announcement)} initial={announcement} />

      {editing && (
        <SlideDialog
          key={editing.id}
          initial={editing}
          isNew={isNew}
          onClose={() => setEditing(null)}
          onSave={(slide) => {
            const list = isNew ? [...heroSlides, slide] : heroSlides.map((s) => (s.id === slide.id ? slide : s));
            const error = validateHeroSlides(list);
            if (error) return error;
            catalogActions.saveHeroSlides(list);
            toast.show("Slayt kaydedildi.");
            setEditing(null);
            return null;
          }}
        />
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Slayt silinsin mi?"
        message={pendingDelete ? `"${pendingDelete.title}" slaytı kaldırılacak.` : ""}
        confirmLabel="Sil"
        tone="danger"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) saveList(heroSlides.filter((s) => s.id !== pendingDelete.id), "Slayt silindi.");
          setPendingDelete(null);
        }}
      />
    </div>
  );
}

function SlideDialog({
  initial,
  isNew,
  onClose,
  onSave,
}: {
  initial: HeroSlide;
  isNew: boolean;
  onClose: () => void;
  /** Returns a list-level error message, or null when saved. */
  onSave: (slide: HeroSlide) => string | null;
}) {
  const [draft, setDraft] = useState(initial);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [listError, setListError] = useState<string | null>(null);
  const set = <K extends keyof HeroSlide>(key: K, value: HeroSlide[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const submit = () => {
    const trimmed = { ...draft, title: draft.title.trim(), subtitle: draft.subtitle.trim(), ctaLabel: draft.ctaLabel.trim(), ctaHref: draft.ctaHref.trim() };
    const found = validateHeroSlide(trimmed);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      document.getElementById(`slide-${first}`)?.focus();
      return;
    }
    setListError(onSave(trimmed));
  };

  const field = (key: "title" | "subtitle" | "ctaLabel" | "ctaHref") => ({
    id: `slide-${key}`,
    value: draft[key],
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": fieldDescribedBy(`slide-${key}`, errors[key]),
    onChange: (e: { target: { value: string } }) => set(key, e.target.value),
  });

  return (
    <Dialog open onClose={onClose} title={isNew ? "Yeni slayt" : "Slaytı düzenle"} className="sm:max-w-3xl">
      <form
        className="space-y-4"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="h-56 overflow-hidden rounded-[var(--radius-card)] border border-line">
          <HeroSlideView slide={{ ...draft, title: draft.title || "Başlık", ctaHref: draft.ctaHref || "#" }} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Başlık" htmlFor="slide-title" required error={errors.title} className="sm:col-span-2">
            <Input maxLength={80} {...field("title")} />
          </FormField>
          <FormField label="Alt metin" htmlFor="slide-subtitle" error={errors.subtitle} className="sm:col-span-2">
            <Textarea rows={2} {...field("subtitle")} />
          </FormField>
          <FormField label="Buton metni" htmlFor="slide-ctaLabel" error={errors.ctaLabel} hint="Boş bırakılırsa buton gösterilmez.">
            <Input {...field("ctaLabel")} />
          </FormField>
          <FormField label="Buton bağlantısı" htmlFor="slide-ctaHref" error={errors.ctaHref} hint="Örn. /garage veya /categories/filtreler">
            <Input {...field("ctaHref")} />
          </FormField>
          <FormField label="Renk düzeni" htmlFor="slide-tone">
            <Select id="slide-tone" value={draft.tone} onChange={(e) => set("tone", e.target.value as HeroSlide["tone"])} options={TONE_OPTIONS} />
          </FormField>
          <div className="flex items-end pb-2">
            <Switch
              id="slide-status"
              label="Yayında"
              checked={draft.status === "published"}
              onChange={(e) => set("status", e.target.checked ? "published" : "draft")}
            />
          </div>
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-ink">Fotoğraf</legend>
          {errors.photo && (
            <p id="slide-photo" tabIndex={-1} className="mb-2 text-sm text-danger">
              {errors.photo}
            </p>
          )}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PHOTO_KEYS.map((key) => {
              const photo = PHOTOS[key];
              const checked = draft.photo === key;
              return (
                <label
                  key={key}
                  className={cn(
                    "relative cursor-pointer overflow-hidden rounded-md border-2 transition-colors",
                    checked ? "border-accent" : "border-transparent hover:border-line-strong",
                  )}
                >
                  <input type="radio" name="slide-photo" value={key} checked={checked} onChange={() => set("photo", key)} className="sr-only" />
                  <span className="relative block aspect-video bg-surface">
                    <Image src={photo.src} alt="" fill sizes="160px" unoptimized={photo.src.endsWith(".svg")} className="object-cover" />
                  </span>
                  <span className="block truncate px-1.5 py-1 text-xs text-ink-soft">{photo.alt}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {listError && (
          <p role="alert" className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
            {listError}
          </p>
        )}

        <div className="flex justify-end gap-2 border-t border-line pt-4">
          <Button variant="secondary" onClick={onClose}>
            Vazgeç
          </Button>
          <Button type="submit">Slaytı kaydet</Button>
        </div>
      </form>
    </Dialog>
  );
}

function AnnouncementForm({ initial }: { initial: Announcement }) {
  const toast = useToast();
  const [draft, setDraft] = useState(initial);
  const [errors, setErrors] = useState<FieldErrors>({});

  return (
    <Panel title="Kampanya şeridi" description="Header'ın üstünde ince bir duyuru şeridi. Ziyaretçi kapatırsa metin değişene kadar o oturumda gizli kalır.">
      <form
        className="space-y-4"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const next = { ...draft, text: draft.text.trim(), href: draft.href.trim() };
          const found = validateAnnouncement(next);
          setErrors(found);
          if (Object.keys(found).length) return;
          catalogActions.saveAnnouncement(next);
          toast.show("Kampanya şeridi kaydedildi.");
        }}
      >
        <Switch label="Şeridi göster" checked={draft.enabled} onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })} />
        <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
          <FormField label="Metin" htmlFor="announcement-text" error={errors.text}>
            <Input
              id="announcement-text"
              value={draft.text}
              aria-invalid={errors.text ? true : undefined}
              aria-describedby={fieldDescribedBy("announcement-text", errors.text)}
              onChange={(e) => setDraft({ ...draft, text: e.target.value })}
            />
          </FormField>
          <FormField label="Bağlantı (isteğe bağlı)" htmlFor="announcement-href" error={errors.href}>
            <Input
              id="announcement-href"
              value={draft.href}
              aria-invalid={errors.href ? true : undefined}
              aria-describedby={fieldDescribedBy("announcement-href", errors.href)}
              onChange={(e) => setDraft({ ...draft, href: e.target.value })}
            />
          </FormField>
        </div>
        <div aria-hidden="true" className={cn("flex items-center gap-2 rounded-md bg-night px-3 py-2 text-sm text-white", !draft.enabled && "opacity-40")}>
          <Megaphone className="size-4 text-accent-bright" />
          <span className="min-w-0 flex-1 truncate text-center">{draft.text || "Önizleme"}</span>
        </div>
        <div className="flex justify-end">
          <Button type="submit">Şeridi kaydet</Button>
        </div>
      </form>
    </Panel>
  );
}
