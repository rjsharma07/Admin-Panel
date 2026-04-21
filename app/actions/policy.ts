"use server";

import { put } from "@vercel/blob";
import { Resend } from "resend";
import dbConnect from "@/lib/mongodb";
import UserPolicy from "@/models/UserPolicy";
import User from "@/models/User";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * uploadPolicyAction
 * 1. Validates the file type server-side.
 * 2. Uploads the document to Vercel Blob.
 * 3. Saves userId + policyUrl to the UserPolicies collection.
 * 4. Sends an email notification to the user (non-blocking).
 */
export async function uploadPolicyAction(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;

    // 1. Validate inputs
    if (!file) return { success: false, error: "No file provided." };
    if (!userId) return { success: false, error: "Missing target User ID." };

    // 2. Server-side MIME type check
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) {
      return { success: false, error: "Invalid file type. Only PDF and Word documents are accepted." };
    }

    // 3. Upload to Vercel Blob
    const blob = await put(`policies/${userId}/${Date.now()}-${file.name}`, file, {
      access: "public",
    });

    if (!blob.url) throw new Error("Vercel Blob did not return a URL.");

    // 4. Connect to DB and persist the record
    await dbConnect();

    const [record, user] = await Promise.all([
      UserPolicy.create({ userId, policyUrl: blob.url }),
      User.findById(userId).select("name email").lean(),
    ]);

    console.log(`✅ UserPolicy saved — ID: ${record._id} | User: ${userId} | URL: ${blob.url}`);

    // 5. Send email notification (non-blocking — failure won't rollback the upload)
    if (user && user.email) {
      try {
        await resend.emails.send({
          from: "Admin Panel <onboarding@resend.dev>",
          to: user.email,
          subject: "Your New Policy Document is Available",
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; background: #ffffff;">
              
              <!-- Header -->
              <div style="margin-bottom: 32px;">
                <div style="display: inline-block; background: #f0f0ff; border-radius: 10px; padding: 10px 16px; margin-bottom: 20px;">
                  <span style="color: #4f46e5; font-size: 12px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;">Policy Update</span>
                </div>
                <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #0f172a; line-height: 1.3;">
                  A new policy document is available for you.
                </h1>
                <p style="margin: 0; font-size: 15px; color: #64748b; line-height: 1.6;">
                  Hi ${(user as any).name || "there"}, your administrator has uploaded a new policy document to your account.
                </p>
              </div>

              <!-- File Card -->
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px 24px; margin-bottom: 28px;">
                <p style="margin: 0 0 4px; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em;">Document</p>
                <p style="margin: 0 0 16px; font-size: 14px; font-weight: 700; color: #1e293b;">${file.name}</p>
                <a href="${blob.url}"
                   style="display: inline-block; background: #4f46e5; color: #ffffff; text-decoration: none; padding: 10px 22px; border-radius: 8px; font-size: 13px; font-weight: 700; letter-spacing: 0.04em;">
                  View Document →
                </a>
              </div>
              
              <!-- Footer -->
              <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.6;">
                If you were not expecting this document, please contact your system administrator. Do not share this link publicly.
              </p>
              <p style="margin: 16px 0 0; font-size: 12px; color: #cbd5e1;">
                © ${new Date().getFullYear()} Admin Panel · This is an automated notification.
              </p>
            </div>
          `,
        });
        console.log(`📧 Email sent to ${user.email}`);
      } catch (emailError: any) {
        // Email failure is non-critical — log it but don't fail the action
        console.error(`⚠️ Email notification failed (upload still succeeded): ${emailError.message}`);
      }
    }

    return {
      success: true,
      url: blob.url,
      policyId: record._id.toString(),
    };

  } catch (error: any) {
    console.error("uploadPolicyAction error:", error);
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}
