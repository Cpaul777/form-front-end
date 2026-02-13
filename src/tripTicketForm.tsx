import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// 1) Schema (validation) — adjust as needed
const TripTicketSchema = z.object({
  formDate: z.string().min(1, "Required"),
  tripTicketNo: z.string().min(1, "Required"),

  // A. Administrative Official
  driverName: z.string().min(1, "Required"),
  plateNo: z.string().min(1, "Required"),
  authorizedPassenger: z.string().min(1, "Required"),
  placesVisited: z.string().min(1, "Required"),
  purpose: z.string().min(1, "Required"),
  authorizingOfficerName: z.string(),

  // B. Driver
  timeDeparture: z.string(),
  timeArrivalAtPlace: z.string(),
  timeDepartureFromPlace: z.string(),
  timeArrivalBack: z.string(),
  approxDistanceKm: z.coerce.number().optional(),

  fuelBalanceInTank: z.coerce.number().optional(),
  fuelIssuedFromStock: z.coerce.number().optional(),
  fuelPurchasedDuringTrip: z.coerce.number().optional(),
  fuelTotal: z.coerce.number().optional(),
  fuelUsedDuringTrip: z.coerce.number().optional(),
  fuelBalanceEnd: z.coerce.number().optional(),

  gearOilIssued: z.coerce.number().optional(),
  lubOilIssued: z.coerce.number().optional(),
  greaseIssued: z.coerce.number().optional(),

  speedometerBegin: z.coerce.number().optional(),
  speedometerEnd: z.coerce.number().optional(),
  speedometerDistance: z.coerce.number().optional(),

  remarks: z.string(),

  driverSignatureName: z.string(),
  passengerSignatureName: z.string(),
});

type TripTicketFormData = z.infer<typeof TripTicketSchema>;


export default function TripTicketForm() {

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(TripTicketSchema),
    defaultValues: {
      authorizingOfficerName: "CHRISTOPHER JOHN B. GAMBOA",
    },
  });

  // Optional: auto-calc some totals like paper form
  const balance = (watch("fuelBalanceInTank") as number) || 0;
  const issued = (watch("fuelIssuedFromStock") as number) || 0;
  const purchased = (watch("fuelPurchasedDuringTrip") as number) || 0;
  const used = (watch("fuelUsedDuringTrip") as number) || 0;

  React.useEffect(() => {
    const total = (balance || 0) + (issued || 0) + (purchased || 0);
    const end = total - (used || 0);
    // only set if user has started typing numbers (avoid NaN spam)
    if (!Number.isNaN(total)) setValue("fuelTotal", total);
    if (!Number.isNaN(end)) setValue("fuelBalanceEnd", end);
  }, [balance, issued, purchased, used, setValue]);

  async function onSubmit(data: TripTicketFormData) {
    // 2) Send to backend (you’ll implement this endpoint)
    const res = await fetch("http://172.18.128.1:3000/trip-tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const txt = await res.text();
      alert("Failed to save: " + txt);
      return;
    }

    alert("Saved!");
  }

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit(onSubmit)} style={styles.paper}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={{ fontSize: 12 }}>Form A</div>
            <div style={styles.logoBox}>SEAL</div>
          </div>

          <div style={styles.headerCenter}>
            <div style={styles.smallText}>Republic of the Philippines</div>
            <div style={styles.smallText}>City Government of Pasig</div>
            <div style={styles.title}>OFFICE OF GENERAL SERVICES</div>
            <div style={styles.subtitle}>MOTORPOOL DIVISION</div>
          </div>

          <div style={styles.headerRight} />
        </div>

        <div style={styles.rowSplit}>
          <div style={styles.rowItem}>
            <label style={styles.label}>Date</label>
            <input type="date" {...register("formDate")} style={styles.input} />
            {errors.formDate && <span style={styles.err}>{errors.formDate.message}</span>}
          </div>

          <div style={styles.rowItem}>
            <label style={styles.label}>TRIP TICKET No.</label>
            <input {...register("tripTicketNo")} style={styles.input} placeholder="e.g. 100-20-01-019" />
            {errors.tripTicketNo && <span style={styles.err}>{errors.tripTicketNo.message}</span>}
          </div>
        </div>

        <div style={{ textAlign: "center", margin: "10px 0", fontWeight: 700 }}>
          DRIVER’S TRIP TICKET
        </div>

        {/* A */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>
            A. To be filled out by the Administrative Official Authorizing Official Travel:
          </div>

          <div style={styles.grid2}>
            <Field label="1. Name of driver of the vehicle" error={errors.driverName?.message}>
              <input {...register("driverName")} style={styles.input} />
            </Field>

            <Field label="2. Government car to be used, Plate No." error={errors.plateNo?.message}>
              <input {...register("plateNo")} style={styles.input} />
            </Field>

            <Field label="3. Name of authorized passenger" error={errors.authorizedPassenger?.message}>
              <input {...register("authorizedPassenger")} style={styles.input} />
            </Field>

            <Field label="4. Place or places to be visited/inspected" error={errors.placesVisited?.message}>
              <input {...register("placesVisited")} style={styles.input} />
            </Field>

            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="5. Purpose" error={errors.purpose?.message}>
                <input {...register("purpose")} style={styles.input} />
              </Field>
            </div>
          </div>

          <div style={styles.signatureBlockRight}>
            <div style={{ fontWeight: 700, textDecoration: "underline" }}>
              <input {...register("authorizingOfficerName")} style={{ ...styles.input, textAlign: "center" }} />
            </div>
            <div style={{ fontSize: 12 }}>OIC, OGS – Motorpool Division</div>
          </div>
        </div>

        {/* B */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>B. To be filled out by the Driver:</div>

          <div style={styles.grid2}>
            <Field label="1. Time of Departure from Office/Garage">
              <input {...register("timeDeparture")} style={styles.input} placeholder="e.g. 8:00 AM" />
            </Field>
            <Field label="2. Time of arrival at (per No. 4 below)">
              <input {...register("timeArrivalAtPlace")} style={styles.input} placeholder="e.g. 9:15 AM" />
            </Field>

            <Field label="3. Time and departure from (per No. 4)">
              <input {...register("timeDepartureFromPlace")} style={styles.input} />
            </Field>
            <Field label="4. Time of arrival back to Office/Garage">
              <input {...register("timeArrivalBack")} style={styles.input} />
            </Field>

            <Field label="5. Approximate distance travelled (to and from) (km)">
              <input type="number" step="0.01" {...register("approxDistanceKm")} style={styles.input} />
            </Field>
          </div>

          <div style={styles.subSection}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>
              6. Gasoline issued, purchased and consumed (liters)
            </div>

            <div style={styles.gridFuel}>
              <FuelRow label="a. Balance in tank" registered={register("fuelBalanceInTank")} />
              <FuelRow label="b. Issued by office from stock" registered={register("fuelIssuedFromStock")} />
              <FuelRow label="c. Add-purchased during trip" registered={register("fuelPurchasedDuringTrip")} />

              <FuelRow label="TOTAL" registered={register("fuelTotal")} readOnly />

              <FuelRow label="d. Deduct: Used during the trip" registered={register("fuelUsedDuringTrip")} />
              <FuelRow label="e. Balance in tank at the end of the trip" registered={register("fuelBalanceEnd")} readOnly />
            </div>
          </div>

          <div style={styles.grid2}>
            <Field label="7. Gear oil issued (liters)">
              <input type="number" step="0.01" {...register("gearOilIssued")} style={styles.input} />
            </Field>
            <Field label="8. Lub. Oil issued (liters)">
              <input type="number" step="0.01" {...register("lubOilIssued")} style={styles.input} />
            </Field>
            <Field label="9. Grease issued (liters)">
              <input type="number" step="0.01" {...register("greaseIssued")} style={styles.input} />
            </Field>
          </div>

          <div style={styles.subSection}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>10. Speedometer readings, if any:</div>
            <div style={styles.gridFuel}>
              <FuelRow label="at the beginning of trip (km)" registered={register("speedometerBegin")} />
              <FuelRow label="at the end of the trip (km)" registered={register("speedometerEnd")} />
              <FuelRow label="distance travelled (per 5 above) (km)" registered={register("speedometerDistance")} />
            </div>
          </div>

          <Field label="11. Remarks">
            <textarea {...register("remarks")} style={{ ...styles.input, minHeight: 60 }} />
          </Field>

          <div style={{ marginTop: 10, fontSize: 12 }}>
            I hereby certify the correctness of the above statement of record of travel.
          </div>

          <div style={styles.signatureRow}>
            <div style={styles.sigBox}>
              <input {...register("driverSignatureName")} style={{ ...styles.input, textAlign: "center" }} />
              <div style={styles.sigLabel}>(Driver)</div>
            </div>
          </div>

          <div style={{ marginTop: 8, fontSize: 12 }}>
            I hereby certify that I used this car on official business as stated above.
          </div>

          <div style={styles.signatureRow}>
            <div style={styles.sigBox}>
              <input {...register("passengerSignatureName")} style={{ ...styles.input, textAlign: "center" }} />
              <div style={styles.sigLabel}>(Name of Passenger)</div>
            </div>
          </div>
        </div>

        <div style={styles.actions}>
          <button type="submit" disabled={isSubmitting} style={styles.btn}>
            {isSubmitting ? "Saving..." : "Save to Database"}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            style={{ ...styles.btn, background: "#eee" }}
          >
            Print
          </button>
        </div>
      </form>
    </div>
  );
}

function Field(props: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={styles.label}>{props.label}</div>
      {props.children}
      {props.error && <div style={styles.err}>{props.error}</div>}
    </div>
  );
}

function FuelRow({
  label,
  registered,
  readOnly,
}: {
  label: string;
  registered: any;
  readOnly?: boolean;
}) {
  return (
    <>
      <div style={{ fontSize: 13 }}>{label}</div>
      <input
        type="number"
        step="0.01"
        {...registered}
        readOnly={readOnly}
        style={{ ...styles.input, background: readOnly ? "#f6f6f6" : "white" }}
      />
      <div style={{ fontSize: 13, textAlign: "right" }}>liters</div>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { background: "#f0f0f0", minHeight: "100vh", padding: 24 },
  paper: {
    maxWidth: 850,
    margin: "0 auto",
    background: "white",
    padding: 24,
    border: "1px solid #ddd",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    fontFamily: "Arial, sans-serif",
  },
  header: { display: "grid", gridTemplateColumns: "140px 1fr 140px", gap: 8, alignItems: "center" },
  headerLeft: { display: "flex", flexDirection: "column", gap: 6 },
  headerCenter: { textAlign: "center" },
  headerRight: {},
  logoBox: {
    width: 70,
    height: 70,
    border: "1px solid #999",
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    fontSize: 12,
    color: "#666",
  },
  smallText: { fontSize: 12 },
  title: { fontSize: 18, fontWeight: 800, marginTop: 4 },
  subtitle: { fontSize: 16, fontWeight: 800 },
  rowSplit: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12 },
  rowItem: { display: "flex", flexDirection: "column" },
  section: { marginTop: 16, borderTop: "1px solid #ddd", paddingTop: 12 },
  sectionTitle: { fontWeight: 700, fontSize: 13, marginBottom: 10 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  subSection: { border: "1px solid #ddd", padding: 12, marginTop: 10 },
  gridFuel: { display: "grid", gridTemplateColumns: "1fr 150px 60px", gap: 8, alignItems: "center" },
  label: { fontSize: 13, marginBottom: 4 },
  input: { width: "100%", padding: "8px 10px", border: "1px solid #aaa", borderRadius: 4, fontSize: 14 },
  err: { color: "crimson", fontSize: 12, marginTop: 4 },
  signatureBlockRight: { marginTop: 14, display: "flex", flexDirection: "column", alignItems: "flex-end" },
  signatureRow: { display: "flex", justifyContent: "flex-end", marginTop: 6 },
  sigBox: { width: 320, textAlign: "center" },
  sigLabel: { fontSize: 12, marginTop: 4 },
  actions: { display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14 },
  btn: { padding: "10px 14px", border: "1px solid #999", borderRadius: 6, cursor: "pointer" },
};
