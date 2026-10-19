import { useExperience } from "@/lib/experience";
import ExperienceDataControls from "@/components/ExperienceDataControls";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { DietaryPreferenceEditor } from "./MealPlanner";
import { Link } from "wouter";
interface ProfileProps {
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}
export default function Profile({
  isDarkMode = false,
  onToggleDarkMode,
}: ProfileProps) {
  const { user, logout } = useAuth();
  const { patch } = useExperience();
  const profile = useQuery<any>({ queryKey: ["/api/profile"] });
  const [form, setForm] = useState({
    sex: "",
    age: "",
    heightCm: "",
    weightKg: "",
    activityLevel: "moderate",
  });
  useEffect(() => {
    if (profile.data)
      setForm({
        sex: profile.data.sex || "",
        age: profile.data.age?.toString() || "",
        heightCm: profile.data.heightCm?.toString() || "",
        weightKg: profile.data.weightKg?.toString() || "",
        activityLevel: profile.data.activityLevel || "moderate",
      });
  }, [profile.data]);
  const save = useMutation({
    mutationFn: async () => {
      const data = {
        sex: form.sex || null,
        age: form.age ? Number(form.age) : null,
        heightCm: form.heightCm ? Number(form.heightCm) : null,
        weightKg: form.weightKg ? Number(form.weightKg) : null,
        activityLevel: form.activityLevel,
      };
      await apiRequest("PATCH", `/api/user/${user!.id}/profile`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      queryClient.invalidateQueries({
        predicate: (q) => String(q.queryKey[0]).startsWith("/api/nutrition/"),
      });
    },
  });
  return (
    <main className="science-page space-y-5">
      <div className="science-heading">
        <h1>Profile & settings</h1>
        <p>Signed in as {user?.username}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link className="text-link" href="/meal-planner">
          Meal planner
        </Link>
        <Link className="text-link" href="/health-insights">
          Health Insights
        </Link>
        {onToggleDarkMode && (
          <Button variant="outline" onClick={onToggleDarkMode}>
            {isDarkMode ? "Light mode" : "Dark mode"}
          </Button>
        )}
        <Button variant="outline" onClick={() => logout()}>
          Log out
        </Button>
      </div>
      <form
        className="bloom-panel space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <h2>Nutrition profile</h2>
        {profile.isLoading ? (
          <p>Loading profile…</p>
        ) : profile.isError ? (
          <p role="alert">
            Profile could not load.{" "}
            <Button type="button" onClick={() => profile.refetch()}>
              Retry
            </Button>
          </p>
        ) : (
          <>
            <label className="block">
              Sex used in energy equation
              <select
                className="bloom-input"
                value={form.sex}
                onChange={(e) => setForm({ ...form, sex: e.target.value })}
              >
                <option value="">Not specified</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </label>
            {(["age", "heightCm", "weightKg"] as const).map((key) => (
              <label className="block" key={key}>
                {key === "age"
                  ? "Age"
                  : key === "heightCm"
                    ? "Height (cm)"
                    : "Weight (kg)"}
                <input
                  className="bloom-input w-full"
                  type="number"
                  min="1"
                  max={key === "age" ? 120 : key === "heightCm" ? 250 : 500}
                  step={key === "age" ? 1 : 0.1}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </label>
            ))}
            <label className="block">
              Activity level
              <select
                className="bloom-input"
                value={form.activityLevel}
                onChange={(e) =>
                  setForm({ ...form, activityLevel: e.target.value })
                }
              >
                {[
                  "sedentary",
                  "light",
                  "moderate",
                  "active",
                  "very_active",
                ].map((v) => (
                  <option key={v} value={v}>
                    {v.replace("_", " ")}
                  </option>
                ))}
              </select>
            </label>
            <p className="panel-note">
              Targets are formula-based estimates. Missing profile values
              currently use defaults.
            </p>
            <Button disabled={save.isPending}>Save nutrition profile</Button>
          </>
        )}
        {save.isSuccess && <p role="status">Profile saved.</p>}
        {save.isError && <p role="alert">{save.error.message}</p>}
      </form>
      <DietaryPreferenceEditor />
      <section className="bloom-panel space-y-3" id="privacy">
        <h2>Privacy & data controls</h2>
        <p>Training and saved-meal exports and deletion are below. Genetic and laboratory records have separate controls in My biology.</p>
        <a href="/precision" className="text-link">Manage biology records & exports</a>
        <p className="panel-note">These controls do not yet provide a complete account export or erasure. Journal entries, gut reports and backup retention require additional coverage. Contact the app operator before uploading information you need fully erased.</p>
      </section>
      <section className="bloom-panel space-y-3"><h2>Your data & choices</h2><p>Review the privacy and export controls below, or revisit optional Everyday setup.</p><Button variant="outline" onClick={()=>patch({onboarding:{status:"not-started"},mode:"everyday"})}>Revisit Everyday setup</Button><img src="/brand/bloom-icon-monochrome.svg" width={32} height={32} alt="" /></section>
      <ExperienceDataControls/>
    </main>
  );
}
