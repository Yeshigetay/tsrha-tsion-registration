"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Plus,
  RefreshCw,
  Star,
  Trash2,
  X,
  BookOpen,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import BackToHomeButton from "@/components/layout/BackToHomeButton";

/* ================================================================
   TYPES
================================================================ */

type AcademicYear = {
  id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type EthiopianDate = {
  year: number;
  month: number;
  day: number;
};

type FormData = {
  name: string;
  startDate: EthiopianDate;
  endDate: EthiopianDate;
  is_active: boolean;
};

type CalendarPickerProps = {
  value: EthiopianDate;
  onChange: (date: EthiopianDate) => void;
  label: string;
};

/* ================================================================
   ETHIOPIAN CALENDAR
================================================================ */

const ETHIOPIAN_MONTHS = [
  "መስከረም",
  "ጥቅምት",
  "ኅዳር",
  "ታኅሣሥ",
  "ጥር",
  "የካቲት",
  "መጋቢት",
  "ሚያዝያ",
  "ግንቦት",
  "ሰኔ",
  "ሐምሌ",
  "ነሐሴ",
  "ጳጉሜን",
];

const WEEK_DAYS = [
  "ሰኞ",
  "ማክሰኞ",
  "ረቡዕ",
  "ሐሙስ",
  "ዓርብ",
  "ቅዳሜ",
  "እሁድ",
];

/*
 * Ethiopian leap-year rule.
 *
 * Example:
 * 2011 -> not leap
 * 2012 -> not leap
 * 2013 -> not leap
 * 2014 -> leap
 */
function isEthiopianLeapYear(year: number) {
  return (year + 1) % 4 === 0;
}

function getEthiopianMonthDays(
  year: number,
  month: number,
) {
  if (month >= 1 && month <= 12) {
    return 30;
  }

  if (month === 13) {
    return isEthiopianLeapYear(year) ? 6 : 5;
  }

  return 0;
}

/* ================================================================
   DATE CONVERSION
================================================================ */

/*
 * Calendar anchor:
 *
 * Ethiopian:
 * 2011-01-01
 *
 * Gregorian:
 * 2018-09-11
 *
 * We calculate dates using the number of days from this anchor.
 *
 * This avoids the duplicate `day` variable problem from the
 * previous JDN implementation and keeps the conversion simple.
 */

const ETHIOPIAN_EPOCH_YEAR = 2011;
const ETHIOPIAN_EPOCH_GREGORIAN = {
  year: 2018,
  month: 9,
  day: 11,
};

const MILLISECONDS_PER_DAY =
  24 * 60 * 60 * 1000;

/* ================================================================
   UTC DATE HELPERS
================================================================ */

function createUtcDate(
  year: number,
  month: number,
  day: number,
) {
  return new Date(
    Date.UTC(year, month - 1, day),
  );
}

function formatGregorianDate(
  date: Date,
) {
  const year = date.getUTCFullYear();
  const month = String(
    date.getUTCMonth() + 1,
  ).padStart(2, "0");
  const day = String(
    date.getUTCDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseGregorianDate(
  value: string | null,
) {
  if (!value) {
    return null;
  }

  const parts = value
    .split("-")
    .map(Number);

  if (parts.length !== 3) {
    return null;
  }

  const [year, month, day] = parts;

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return null;
  }

  return createUtcDate(
    year,
    month,
    day,
  );
}

/* ================================================================
   ETHIOPIAN DATE -> DAY OFFSET
================================================================ */

function countLeapYearsBefore(
  year: number,
) {
  /*
   * Count Ethiopian leap years from year 1
   * through year - 1.
   */
  if (year <= 1) {
    return 0;
  }

  return Math.floor(year / 4);
}

function countLeapYearsBetween(
  startYear: number,
  endYear: number,
) {
  /*
   * Counts leap years from startYear through
   * endYear, inclusive.
   *
   * Leap condition:
   * (year + 1) % 4 === 0
   */
  if (endYear < startYear) {
    return 0;
  }

  let count = 0;

  for (
    let year = startYear;
    year <= endYear;
    year++
  ) {
    if (isEthiopianLeapYear(year)) {
      count++;
    }
  }

  return count;
}

function ethiopianDateToDayOffset(
  date: EthiopianDate,
) {
  /*
   * Number of days from Ethiopian 2011-01-01.
   */

  const fullYears =
    date.year -
    ETHIOPIAN_EPOCH_YEAR;

  let days = fullYears * 365;

  if (fullYears > 0) {
    days += countLeapYearsBetween(
      ETHIOPIAN_EPOCH_YEAR,
      date.year - 1,
    );
  } else if (fullYears < 0) {
    days -= countLeapYearsBetween(
      date.year,
      ETHIOPIAN_EPOCH_YEAR - 1,
    );
  }

  /*
   * Months 1-12 have 30 days each.
   * Month 13 follows them.
   */
  days +=
    (date.month - 1) * 30;

  days += date.day - 1;

  return days;
}

/* ================================================================
   ETHIOPIAN -> GREGORIAN
================================================================ */

function ethiopianToGregorian(
  date: EthiopianDate,
) {
  const epoch = createUtcDate(
    ETHIOPIAN_EPOCH_GREGORIAN.year,
    ETHIOPIAN_EPOCH_GREGORIAN.month,
    ETHIOPIAN_EPOCH_GREGORIAN.day,
  );

  const offset =
    ethiopianDateToDayOffset(date);

  return new Date(
    epoch.getTime() +
      offset *
        MILLISECONDS_PER_DAY,
  );
}

function ethiopianToGregorianString(
  date: EthiopianDate,
) {
  return formatGregorianDate(
    ethiopianToGregorian(date),
  );
}

/* ================================================================
   GREGORIAN -> ETHIOPIAN
================================================================ */

function gregorianToEthiopian(
  gregorian: Date,
): EthiopianDate {
  const epoch = createUtcDate(
    ETHIOPIAN_EPOCH_GREGORIAN.year,
    ETHIOPIAN_EPOCH_GREGORIAN.month,
    ETHIOPIAN_EPOCH_GREGORIAN.day,
  );

  const difference = Math.floor(
    (gregorian.getTime() -
      epoch.getTime()) /
      MILLISECONDS_PER_DAY,
  );

  /*
   * Estimate the Ethiopian year.
   */
  let ethiopianYear =
    ETHIOPIAN_EPOCH_YEAR +
    Math.floor(difference / 365);

  /*
   * Correct the estimate.
   */
  while (
    ethiopianDateToDayOffset({
      year: ethiopianYear + 1,
      month: 1,
      day: 1,
    }) <= difference
  ) {
    ethiopianYear++;
  }

  while (
    ethiopianDateToDayOffset({
      year: ethiopianYear,
      month: 1,
      day: 1,
    }) > difference
  ) {
    ethiopianYear--;
  }

  const yearStartOffset =
    ethiopianDateToDayOffset({
      year: ethiopianYear,
      month: 1,
      day: 1,
    });

  const dayOfYear =
    difference - yearStartOffset;

  let month =
    Math.floor(dayOfYear / 30) + 1;

  let selectedDay =
    (dayOfYear % 30) + 1;

  /*
   * Safety correction for Pagumen.
   */
  if (month > 13) {
    month = 13;
    selectedDay =
      getEthiopianMonthDays(
        ethiopianYear,
        13,
      );
  }

  return {
    year: ethiopianYear,
    month,
    day: selectedDay,
  };
}

function gregorianStringToEthiopian(
  dateString: string | null,
) {
  const date =
    parseGregorianDate(dateString);

  if (!date) {
    return null;
  }

  return gregorianToEthiopian(date);
}

/* ================================================================
   ETHIOPIAN DATE COMPARISON
================================================================ */

function compareEthiopianDates(
  first: EthiopianDate,
  second: EthiopianDate,
) {
  const firstOffset =
    ethiopianDateToDayOffset(first);

  const secondOffset =
    ethiopianDateToDayOffset(second);

  return firstOffset - secondOffset;
}

/* ================================================================
   FORMAT ETHIOPIAN DATE
================================================================ */

function formatEthiopianDate(
  date: EthiopianDate,
) {
  return `${date.year} ዓ.ም — ${
    ETHIOPIAN_MONTHS[date.month - 1]
  } ${date.day}`;
}

/* ================================================================
   CURRENT ETHIOPIAN DATE
================================================================ */

function getCurrentEthiopianDate(): EthiopianDate {
  const now = new Date();

  const utcDate = createUtcDate(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate(),
  );

  return gregorianToEthiopian(
    utcDate,
  );
}

/* ================================================================
   CALENDAR PICKER
================================================================ */

function EthiopianCalendarPicker({
  value,
  onChange,
  label,
}: CalendarPickerProps) {
  const [open, setOpen] =
    useState(false);

  const [viewYear, setViewYear] =
    useState(value.year);

  const [viewMonth, setViewMonth] =
    useState(value.month);

  useEffect(() => {
    setViewYear(value.year);
    setViewMonth(value.month);
  }, [value.year, value.month]);

  const daysInMonth =
    getEthiopianMonthDays(
      viewYear,
      viewMonth,
    );

  /*
   * Ethiopian dates are aligned with a Monday-first calendar.
   *
   * We use the converted Gregorian date to determine
   * the weekday.
   */
  const firstGregorianDate =
    ethiopianToGregorian({
      year: viewYear,
      month: viewMonth,
      day: 1,
    });

  /*
   * JavaScript:
   * Sunday = 0
   * Monday = 1
   *
   * Convert to:
   * Monday = 0
   * Sunday = 6
   */
  const mondayFirstOffset =
    (firstGregorianDate.getUTCDay() + 6) %
    7;

  const days = Array.from(
    {
      length: daysInMonth,
    },
    (_, index) => index + 1,
  );

  function previousMonth() {
    if (viewMonth === 1) {
      setViewYear(
        (year) => year - 1,
      );
      setViewMonth(13);
    } else {
      setViewMonth(
        (month) => month - 1,
      );
    }
  }

  function nextMonth() {
    if (viewMonth === 13) {
      setViewYear(
        (year) => year + 1,
      );
      setViewMonth(1);
    } else {
      setViewMonth(
        (month) => month + 1,
      );
    }
  }

  function selectDay(dayNumber: number) {
    onChange({
      year: viewYear,
      month: viewMonth,
      day: dayNumber,
    });

    setOpen(false);
  }

  return (
    <div className="relative">
      <label className="mb-2 block text-sm font-bold text-gray-700">
        {label}
      </label>

      <button
        type="button"
        onClick={() =>
          setOpen(
            (current) => !current,
          )
        }
        className="flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-left transition hover:border-[#0d3b78] hover:bg-white focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0d3b78] text-[#d4af37]">
            <CalendarDays size={19} />
          </div>

          <div>
            <p className="text-xs text-gray-400">
              የኢትዮጵያ ዘመን
            </p>

            <p className="font-bold text-[#172033]">
              {formatEthiopianDate(value)}
            </p>
          </div>
        </div>

        <ChevronRight
          size={18}
          className={`text-gray-400 transition ${
            open ? "rotate-90" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl">
          {/* HEADER */}

          <div className="bg-gradient-to-r from-[#071f45] to-[#0d3b78] px-4 py-4 text-white">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={previousMonth}
                className="rounded-xl p-2 transition hover:bg-white/10"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="text-center">
                <p className="text-lg font-bold">
                  {
                    ETHIOPIAN_MONTHS[
                      viewMonth - 1
                    ]
                  }
                </p>

                <p className="mt-0.5 text-sm text-blue-100">
                  {viewYear} ዓ.ም
                </p>
              </div>

              <button
                type="button"
                onClick={nextMonth}
                className="rounded-xl p-2 transition hover:bg-white/10"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* YEAR SELECTOR */}

            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setViewYear(
                    (year) => year - 1,
                  )
                }
                className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20"
              >
                −
              </button>

              <span className="min-w-24 text-center text-sm font-bold">
                {viewYear} ዓ.ም
              </span>

              <button
                type="button"
                onClick={() =>
                  setViewYear(
                    (year) => year + 1,
                  )
                }
                className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20"
              >
                +
              </button>
            </div>
          </div>

          {/* WEEK DAYS */}

          <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50 px-3 py-2">
            {WEEK_DAYS.map(
              (weekDay) => (
                <div
                  key={weekDay}
                  className="text-center text-[11px] font-bold text-gray-400"
                >
                  {weekDay}
                </div>
              ),
            )}
          </div>

          {/* DAYS */}

          <div className="grid grid-cols-7 gap-1 p-3">
            {Array.from({
              length: mondayFirstOffset,
            }).map(
              (_, index) => (
                <div
                  key={`empty-${index}`}
                />
              ),
            )}

            {days.map(
              (dayNumber) => {
                const selected =
                  value.year ===
                    viewYear &&
                  value.month ===
                    viewMonth &&
                  value.day ===
                    dayNumber;

                return (
                  <button
                    key={dayNumber}
                    type="button"
                    onClick={() =>
                      selectDay(
                        dayNumber,
                      )
                    }
                    className={`aspect-square rounded-xl text-sm font-semibold transition ${
                      selected
                        ? "bg-[#0d3b78] text-white shadow-md"
                        : "text-gray-700 hover:bg-blue-50 hover:text-[#0d3b78]"
                    }`}
                  >
                    {dayNumber}
                  </button>
                );
              },
            )}
          </div>

          {/* FOOTER */}

          <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
            <p className="text-center text-xs text-gray-500">
              {daysInMonth} ቀናት
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   PAGE
================================================================ */

export default function AcademicYearsPage() {
  const supabase = createClient();

  const currentEthiopianDate =
    getCurrentEthiopianDate();

  const [years, setYears] =
    useState<AcademicYear[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [showForm, setShowForm] =
    useState(false);

  const [editingYear, setEditingYear] =
    useState<AcademicYear | null>(null);

  const [form, setForm] =
    useState<FormData>({
      name: "",
      startDate: {
        year:
          currentEthiopianDate.year,
        month: 1,
        day: 1,
      },
      endDate: {
        year:
          currentEthiopianDate.year,
        month: 13,
        day: isEthiopianLeapYear(
          currentEthiopianDate.year,
        )
          ? 6
          : 5,
      },
      is_active: false,
    });

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  /* ================================================================
     ACTIVE YEAR
  ================================================================ */

  const activeYear = useMemo(
    () =>
      years.find(
        (year) => year.is_active,
      ),
    [years],
  );

  /* ================================================================
     LOAD YEARS
  ================================================================ */

  async function loadYears(
    showRefresh = false,
  ) {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    const {
      data,
      error: loadError,
    } = await supabase
      .from("academic_years")
      .select("*")
      .order("start_date", {
        ascending: false,
      });

    if (loadError) {
      setError(loadError.message);
      setYears([]);
    } else {
      setYears(
        (data ??
          []) as AcademicYear[],
      );
    }

    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    loadYears();
  }, []);

  /* ================================================================
     ADD FORM
  ================================================================ */

  function openAddForm() {
    const nextYear = activeYear
      ? Number(
          activeYear.name.match(
            /\d+/,
          )?.[0] ??
            currentEthiopianDate.year,
        ) + 1
      : currentEthiopianDate.year;

    setEditingYear(null);

    setForm({
      name: `${nextYear} ዓ.ም`,
      startDate: {
        year: nextYear,
        month: 1,
        day: 1,
      },
      endDate: {
        year: nextYear,
        month: 13,
        day: isEthiopianLeapYear(
          nextYear,
        )
          ? 6
          : 5,
      },
      is_active: false,
    });

    setMessage("");
    setError("");
    setShowForm(true);
  }

  /* ================================================================
     EDIT FORM
  ================================================================ */

  function openEditForm(
    year: AcademicYear,
  ) {
    const startDate =
      gregorianStringToEthiopian(
        year.start_date,
      );

    const endDate =
      gregorianStringToEthiopian(
        year.end_date,
      );

    setEditingYear(year);

    setForm({
      name: year.name,

      startDate:
        startDate ?? {
          year:
            currentEthiopianDate.year,
          month: 1,
          day: 1,
        },

      endDate:
        endDate ?? {
          year:
            currentEthiopianDate.year,
          month: 13,
          day: isEthiopianLeapYear(
            currentEthiopianDate.year,
          )
            ? 6
            : 5,
        },

      is_active: year.is_active,
    });

    setMessage("");
    setError("");
    setShowForm(true);
  }

  /* ================================================================
     CLOSE FORM
  ================================================================ */

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingYear(null);
    setError("");
  }

  /* ================================================================
     DATE UPDATES
  ================================================================ */

  function updateStartDate(
    date: EthiopianDate,
  ) {
    setForm((current) => ({
      ...current,
      startDate: date,
      name: `${date.year} ዓ.ም`,
    }));
  }

  function updateEndDate(
    date: EthiopianDate,
  ) {
    setForm((current) => ({
      ...current,
      endDate: date,
    }));
  }

  /* ================================================================
     SAVE YEAR
  ================================================================ */

  async function saveYear() {
    setMessage("");
    setError("");

    const startDays =
      getEthiopianMonthDays(
        form.startDate.year,
        form.startDate.month,
      );

    const endDays =
      getEthiopianMonthDays(
        form.endDate.year,
        form.endDate.month,
      );

    if (
      form.startDate.month < 1 ||
      form.startDate.month > 13 ||
      form.startDate.day < 1 ||
      form.startDate.day > startDays
    ) {
      setError(
        "የመጀመሪያ ቀን ትክክል አይደለም።",
      );
      return;
    }

    if (
      form.endDate.month < 1 ||
      form.endDate.month > 13 ||
      form.endDate.day < 1 ||
      form.endDate.day > endDays
    ) {
      setError(
        "የመጨረሻ ቀን ትክክል አይደለም።",
      );
      return;
    }

    if (
      compareEthiopianDates(
        form.startDate,
        form.endDate,
      ) > 0
    ) {
      setError(
        "የመጀመሪያ ቀን ከመጨረሻ ቀን በኋላ መሆን አይችልም።",
      );
      return;
    }

    if (!form.name.trim()) {
      setError(
        "የትምህርት ዘመኑ ስም ያስፈልጋል።",
      );
      return;
    }

    setSaving(true);

    try {
      /*
       * If this year becomes active,
       * deactivate all other years first.
       */
      if (form.is_active) {
        const {
          error: deactivateError,
        } = await supabase
          .from("academic_years")
          .update({
            is_active: false,
          })
          .neq(
            "id",
            editingYear?.id ??
              "00000000-0000-0000-0000-000000000000",
          );

        if (deactivateError) {
          throw new Error(
            deactivateError.message,
          );
        }
      }

      const payload = {
        name: form.name.trim(),
        start_date:
          ethiopianToGregorianString(
            form.startDate,
          ),
        end_date:
          ethiopianToGregorianString(
            form.endDate,
          ),
        is_active:
          form.is_active,
      };

      /* ============================================================
         UPDATE
      ============================================================ */

      if (editingYear) {
        const {
          data,
          error: updateError,
        } = await supabase
          .from("academic_years")
          .update(payload)
          .eq(
            "id",
            editingYear.id,
          )
          .select()
          .single();

        if (updateError) {
          throw new Error(
            updateError.message,
          );
        }

        setYears((current) =>
          current.map((year) => {
            if (
              year.id === data.id
            ) {
              return data as AcademicYear;
            }

            if (form.is_active) {
              return {
                ...year,
                is_active: false,
              };
            }

            return year;
          }),
        );

        setMessage(
          "የትምህርት ዘመኑ በተሳካ ሁኔታ ተስተካክሏል።",
        );
      }

      /* ============================================================
         INSERT
      ============================================================ */

      else {
        const {
          data,
          error: insertError,
        } = await supabase
          .from("academic_years")
          .insert(payload)
          .select()
          .single();

        if (insertError) {
          throw new Error(
            insertError.message,
          );
        }

        setYears((current) => {
          const updated =
            form.is_active
              ? current.map(
                  (year) => ({
                    ...year,
                    is_active: false,
                  }),
                )
              : [...current];

          return [
            data as AcademicYear,
            ...updated,
          ];
        });

        setMessage(
          "አዲሱ የትምህርት ዘመን ተጨምሯል።",
        );
      }

      setShowForm(false);
      setEditingYear(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "የትምህርት ዘመኑን ማስቀመጥ አልተቻለም።",
      );
    } finally {
      setSaving(false);
    }
  }

  /* ================================================================
     SET ACTIVE
  ================================================================ */

  async function setActiveYear(
    year: AcademicYear,
  ) {
    setMessage("");
    setError("");

    if (year.is_active) {
      return;
    }

    const confirmed =
      window.confirm(
        `“${year.name}”ን ንቁ የትምህርት ዘመን ማድረግ ይፈልጋሉ?`,
      );

    if (!confirmed) {
      return;
    }

    const {
      error: deactivateError,
    } = await supabase
      .from("academic_years")
      .update({
        is_active: false,
      })
      .neq("id", year.id);

    if (deactivateError) {
      setError(
        deactivateError.message,
      );
      return;
    }

    const {
      error: activateError,
    } = await supabase
      .from("academic_years")
      .update({
        is_active: true,
      })
      .eq("id", year.id);

    if (activateError) {
      setError(
        activateError.message,
      );
      return;
    }

    setYears((current) =>
      current.map((item) => ({
        ...item,
        is_active:
          item.id === year.id,
      })),
    );

    setMessage(
      `“${year.name}” ንቁ የትምህርት ዘመን ሆኗል።`,
    );
  }

  /* ================================================================
     DELETE
  ================================================================ */

  async function deleteYear(
    year: AcademicYear,
  ) {
    setMessage("");
    setError("");

    if (year.is_active) {
      setError(
        "ንቁ የሆነ የትምህርት ዘመን መሰረዝ አይቻልም።",
      );
      return;
    }

    const confirmed =
      window.confirm(
        `“${year.name}”ን መሰረዝ ይፈልጋሉ?\n\nይህ ሂደት ሊቀለበስ አይችልም።`,
      );

    if (!confirmed) {
      return;
    }

    const {
      error: deleteError,
    } = await supabase
      .from("academic_years")
      .delete()
      .eq("id", year.id);

    if (deleteError) {
      setError(
        deleteError.message,
      );
      return;
    }

    setYears((current) =>
      current.filter(
        (item) =>
          item.id !== year.id,
      ),
    );

    setMessage(
      "የትምህርት ዘመኑ ተሰርዟል።",
    );
  }

  /* ================================================================
     UI
  ================================================================ */

  return (
    <main className="min-h-screen bg-[#f8f5ec] text-[#172033]">
      {/* ============================================================
          HEADER
      ============================================================ */}

      <header className="border-b border-white/10 bg-gradient-to-r from-[#071f45] via-[#0d3b78] to-[#1454a4] text-white shadow-xl">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#d4af37]/40 bg-white/10 shadow-lg backdrop-blur">
                <CalendarDays
                  size={28}
                  className="text-[#d4af37]"
                />
              </div>

              <div>
                <p className="text-sm font-medium tracking-wide text-blue-100">
                  ጽርሐ ጽዮን ሰንበት ት/ቤት
                </p>

                <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                  የትምህርት ዘመን
                </h1>

                <p className="mt-1 text-sm text-blue-100">
                  የትምህርት ዘመናትን ያስተዳድሩ
                </p>
              </div>
            </div>

            <BackToHomeButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ============================================================
            ACTIONS
        ============================================================ */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#172033]">
              የትምህርት ዘመናት
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              የአባላትን የትምህርት ታሪክ በየዓመቱ ለማስተዳደር።
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() =>
                loadYears(true)
              }
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-[#0d3b78] shadow-sm transition hover:border-[#0d3b78] hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              አድስ
            </button>

            <button
              type="button"
              onClick={openAddForm}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0d3b78] to-[#1454a4] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <Plus size={18} />
              አዲስ ዓመት
            </button>
          </div>
        </div>

        {/* ============================================================
            MESSAGES
        ============================================================ */}

        {message && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-semibold text-green-800">
            <CheckCircle2 size={20} />
            {message}
          </div>
        )}

        {error && !showForm && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* ============================================================
            ACTIVE YEAR
        ============================================================ */}

        <section className="mb-8 overflow-hidden rounded-3xl border border-[#d4af37]/30 bg-gradient-to-br from-[#fffdf5] via-white to-[#f8f5ec] shadow-lg">
          <div className="border-b border-[#d4af37]/20 bg-[#d4af37]/10 px-6 py-4">
            <div className="flex items-center gap-2">
              <Star
                size={18}
                className="fill-[#d4af37] text-[#b89018]"
              />

              <h2 className="font-bold text-[#0d3b78]">
                ንቁ የትምህርት ዘመን
              </h2>
            </div>
          </div>

          <div className="p-6">
            {activeYear ? (
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl font-bold text-[#172033]">
                      {activeYear.name}
                    </h3>

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                      <CheckCircle2
                        size={14}
                      />
                      ንቁ
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                    <span>
                      መጀመሪያ:{" "}
                      <strong className="text-gray-700">
                        {activeYear.start_date
                          ? (() => {
                              const date =
                                gregorianStringToEthiopian(
                                  activeYear.start_date,
                                );

                              return date
                                ? formatEthiopianDate(
                                    date,
                                  )
                                : "—";
                            })()
                          : "—"}
                      </strong>
                    </span>

                    <span>
                      መጨረሻ:{" "}
                      <strong className="text-gray-700">
                        {activeYear.end_date
                          ? (() => {
                              const date =
                                gregorianStringToEthiopian(
                                  activeYear.end_date,
                                );

                              return date
                                ? formatEthiopianDate(
                                    date,
                                  )
                                : "—";
                            })()
                          : "—"}
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#0d3b78] px-5 py-4 text-white shadow-lg">
                  <div className="flex items-center gap-3">
                    <BookOpen
                      size={22}
                      className="text-[#d4af37]"
                    />

                    <div>
                      <p className="text-xs text-blue-200">
                        የትምህርት ዓመት
                      </p>

                      <p className="font-bold">
                        ንቁ የአሁኑ ዓመት
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#d4af37]/50 bg-white px-6 py-10 text-center">
                <CalendarDays
                  size={42}
                  className="mx-auto text-[#d4af37]"
                />

                <h3 className="mt-4 text-lg font-bold text-[#172033]">
                  ንቁ የትምህርት ዘመን የለም
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  ለመጀመር አዲስ የትምህርት ዘመን ይፍጠሩ።
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ============================================================
            YEARS
        ============================================================ */}

        <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg">
          <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#172033]">
                የተመዘገቡ የትምህርት ዘመናት
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {years.length} የትምህርት ዘመን
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center px-6 py-20">
              <RefreshCw
                size={28}
                className="animate-spin text-[#0d3b78]"
              />
            </div>
          ) : years.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <CalendarDays
                size={48}
                className="mx-auto text-gray-300"
              />

              <h3 className="mt-4 text-lg font-bold text-gray-700">
                የትምህርት ዘመን አልተገኘም
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                የመጀመሪያውን የትምህርት ዘመን ለመጨመር ከላይ ያለውን
                “አዲስ ዓመት” ይጫኑ።
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {years.map((year) => {
                const start =
                  gregorianStringToEthiopian(
                    year.start_date,
                  );

                const end =
                  gregorianStringToEthiopian(
                    year.end_date,
                  );

                return (
                  <div
                    key={year.id}
                    className={`group p-6 transition ${
                      year.is_active
                        ? "bg-blue-50/50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                            year.is_active
                              ? "bg-[#0d3b78] text-[#d4af37]"
                              : "bg-gray-100 text-[#0d3b78]"
                          }`}
                        >
                          <CalendarDays
                            size={22}
                          />
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-bold text-[#172033]">
                              {year.name}
                            </h3>

                            {year.is_active && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">
                                <CheckCircle2
                                  size={13}
                                />
                                ንቁ
                              </span>
                            )}
                          </div>

                          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500">
                            <span>
                              መጀመሪያ:{" "}
                              <strong className="text-gray-700">
                                {start
                                  ? formatEthiopianDate(
                                      start,
                                    )
                                  : "—"}
                              </strong>
                            </span>

                            <span>
                              መጨረሻ:{" "}
                              <strong className="text-gray-700">
                                {end
                                  ? formatEthiopianDate(
                                      end,
                                    )
                                  : "—"}
                              </strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {!year.is_active && (
                          <button
                            type="button"
                            onClick={() =>
                              setActiveYear(
                                year,
                              )
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700 transition hover:bg-green-100"
                          >
                            <CheckCircle2
                              size={16}
                            />
                            ንቁ አድርግ
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            openEditForm(
                              year,
                            )
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-[#0d3b78] transition hover:bg-blue-100"
                        >
                          <Edit3 size={16} />
                          አስተካክል
                        </button>

                        {!year.is_active && (
                          <button
                            type="button"
                            onClick={() =>
                              deleteYear(
                                year,
                              )
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                          >
                            <Trash2
                              size={16}
                            />
                            ሰርዝ
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ============================================================
            FOOTER NOTE
        ============================================================ */}

        <div className="mt-6 rounded-2xl border border-[#d4af37]/20 bg-white px-5 py-4 text-center text-sm text-gray-500 shadow-sm">
          የትምህርት ዘመን ከተፈጠረ በኋላ አባላትን ወደ የክፍል ደረጃዎች
          መመደብ ይችላሉ።
        </div>
      </div>

      {/* ================================================================
          ADD / EDIT FORM
      ================================================================ */}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071f45]/60 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            {/* HEADER */}

            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-[#071f45] to-[#0d3b78] px-6 py-5 text-white">
              <div>
                <h2 className="text-xl font-bold">
                  {editingYear
                    ? "የትምህርት ዘመን አስተካክል"
                    : "አዲስ የትምህርት ዘመን"}
                </h2>

                <p className="mt-1 text-sm text-blue-100">
                  ቀኖችን በኢትዮጵያ ዘመን አቆጣጠር ይምረጡ
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-xl p-2 text-blue-100 transition hover:bg-white/10 hover:text-white"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {error}
                </div>
              )}

              {/* ACADEMIC YEAR NAME */}

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  የትምህርት ዘመን
                </label>

                <div className="rounded-2xl border border-[#d4af37]/30 bg-gradient-to-r from-[#fffdf5] to-white px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0d3b78] text-[#d4af37]">
                      <BookOpen size={21} />
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">
                        የትምህርት ዘመን
                      </p>

                      <p className="text-xl font-bold text-[#0d3b78]">
                        {form.name}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  የትምህርት ዘመኑ በመጀመሪያ ቀን ከተመረጠው የኢትዮጵያ
                  ዓመት በራስ-ሰር ይዘጋጃል።
                </p>
              </div>

              {/* CALENDAR PICKERS */}

              <div className="grid gap-5 md:grid-cols-2">
                <EthiopianCalendarPicker
                  label="የመጀመሪያ ቀን"
                  value={
                    form.startDate
                  }
                  onChange={
                    updateStartDate
                  }
                />

                <EthiopianCalendarPicker
                  label="የመጨረሻ ቀን"
                  value={
                    form.endDate
                  }
                  onChange={
                    updateEndDate
                  }
                />
              </div>

              {/* SELECTED RANGE */}

              <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <CalendarDays
                    size={18}
                    className="text-[#0d3b78]"
                  />

                  <p className="font-bold text-[#0d3b78]">
                    የተመረጠው የትምህርት ዘመን
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-white p-3">
                    <p className="text-xs text-gray-400">
                      መጀመሪያ
                    </p>

                    <p className="mt-1 font-bold text-gray-700">
                      {formatEthiopianDate(
                        form.startDate,
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-3">
                    <p className="text-xs text-gray-400">
                      መጨረሻ
                    </p>

                    <p className="mt-1 font-bold text-gray-700">
                      {formatEthiopianDate(
                        form.endDate,
                      )}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-xs text-gray-500">
                  የተመረጡት ቀኖች በSupabase ውስጥ እንደ Gregorian{" "}
                  <code>date</code>{" "}
                  ይቀመጣሉ፣ ነገር ግን በስርዓቱ ውስጥ ለአስተዳዳሪው
                  እንደ ኢትዮጵያዊ ቀን ይታያሉ።
                </p>
              </div>

              {/* ACTIVE */}

              <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-[#d4af37]/30 bg-[#fffdf5] p-4 transition hover:bg-[#fffaf0]">
                <input
                  type="checkbox"
                  checked={
                    form.is_active
                  }
                  onChange={(event) =>
                    setForm(
                      (current) => ({
                        ...current,
                        is_active:
                          event.target
                            .checked,
                      }),
                    )
                  }
                  className="mt-1 h-5 w-5 rounded border-gray-300 accent-[#0d3b78]"
                />

                <div>
                  <p className="font-bold text-[#172033]">
                    ይህን ዓመት ንቁ አድርግ
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    ንቁ ዓመት አንድ ብቻ ይኖራል። ይህን ከመረጡ
                    ሌላው ንቁ ዓመት ይቦዝናል።
                  </p>
                </div>
              </label>
            </div>

            {/* FOOTER */}

            <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-gray-100 bg-white px-6 py-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
              >
                ሰርዝ
              </button>

              <button
                type="button"
                onClick={saveYear}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0d3b78] to-[#1454a4] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <RefreshCw
                      size={17}
                      className="animate-spin"
                    />
                    በማስቀመጥ ላይ...
                  </>
                ) : (
                  <>
                    <CheckCircle2
                      size={17}
                    />

                    {editingYear
                      ? "ለውጡን አስቀምጥ"
                      : "የትምህርት ዘመን ፍጠር"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}