/*
==================================================
ไฟล์: components/common/ErrorBoundary.tsx

หน้าที่:
Error Boundary ระดับ Global สำหรับจับข้อผิดพลาด
และแสดง UI สำรองเมื่อเกิด Runtime Error

ใช้สำหรับ:
- ครอบ BeautyShopApp ทั้งหมด

ทำงานร่วมกับ:
- BeautyShopApp
- app/layout.tsx

หมายเหตุ:
- ใช้ React Component Lifecycle (componentDidCatch)
- แสดง UI เป็นภาษาไทย
- มีปุ่มลองใหม่ (Retry)
==================================================
*/

"use client";

import { Component, ReactNode } from "react";

/**
 * จุดประสงค์:
 * จับข้อผิดพลาดที่เกิดขึ้นใน Component Tree
 * และแสดง UI สำรองแทนการ Crash ทั้งแอป
 *
 * การทำงาน:
 * 1. ถ้าเกิด Error ใน children จะเรียก componentDidCatch
 * 2. เปลี่ยน state.hasError เป็น true
 * 3. แสดง Error UI แทน children
 *
 * Parameter:
 * children (ReactNode) - Component ที่ต้องการให้ Error Boundary ครอบ
 *
 * Return:
 * - ถ้าไม่มี Error: render children
 * - ถ้ามี Error: render Error UI
 *
 * หมายเหตุ:
 * Error Boundary จับเฉพาะ Runtime Error ใน Render/Lifecycle
 * ไม่สามารถจับ Error ใน Event Handler, Async Code, หรือ Server Side
 */
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack?: string }) {
    console.error("LUXEA Error Boundary จับ Error ได้:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "2rem",
          textAlign: "center",
          fontFamily: "sans-serif",
          backgroundColor: "#f9f1f3",
        }}>
          <div style={{
            maxWidth: "480px",
            padding: "3rem",
            borderRadius: "32px",
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(183,110,121,0.14)",
            boxShadow: "0 28px 90px rgba(120,80,90,0.16)",
          }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>
              {"\u2726"}
            </div>
            <h1 style={{
              fontSize: "1.5rem",
              fontWeight: 900,
              color: "#A35D6A",
              marginBottom: "0.5rem",
            }}>
              LUXEA
            </h1>
            <p style={{
              fontSize: "0.875rem",
              color: "#6B5B5E",
              marginBottom: "0.25rem",
            }}>
              เกิดข้อผิดพลาดบางอย่าง
            </p>
            <p style={{
              fontSize: "0.75rem",
              color: "#9C8B8E",
              marginBottom: "2rem",
            }}>
              กรุณาลองใหม่อีกครั้ง
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              style={{
                padding: "0.75rem 2rem",
                borderRadius: "9999px",
                border: "none",
                background: "linear-gradient(180deg, #B76E79, #A35D6A)",
                color: "white",
                fontWeight: 700,
                fontSize: "0.875rem",
                cursor: "pointer",
                boxShadow: "0 8px 24px rgba(163,93,106,0.24)",
              }}
            >
              ลองใหม่
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}