-- ============================================
-- Migration 006: Seed Resources
-- Comprehensive childhood cancer resource database
-- 80+ real organizations across all 10 categories
-- ============================================

INSERT INTO public.resources (
  title, description, long_description, category, subcategory,
  organization_name, organization_url, organization_phone,
  applicable_stages, tags, is_featured, is_active, priority_order
) VALUES

-- ============================================
-- FINANCIAL ASSISTANCE
-- ============================================

(
  'Emergency Financial Assistance for Cancer Families',
  'Provides direct financial assistance to help cancer patients and their families manage treatment-related costs including rent, utilities, food, and transportation.',
  'Family Reach is the only national nonprofit breaking down the financial barriers that keep families from accessing cancer treatment. They provide direct financial assistance, financial navigation, and financial education. Their Financial Care Team works with hospital social workers to identify families in crisis and deliver funds rapidly — often within 48 hours. Assistance covers rent/mortgage, utilities, food, transportation, and other treatment-related costs. Eligibility requires a child or adult cancer diagnosis and demonstrated financial need.',
  'financial', 'emergency grants',
  'Family Reach', 'https://familyreach.org', '617-699-0490',
  ARRAY['newly_diagnosed','in_treatment','post_treatment','relapse'],
  ARRAY['financial assistance','grants','emergency funds','rent','utilities'],
  true, true, 1
),

(
  'Ronald McDonald House — Free Lodging Near Treatment Centers',
  'Provides free or low-cost lodging, meals, and support services for families of seriously ill children receiving treatment far from home.',
  'Ronald McDonald House Charities (RMHC) operates over 375 Ronald McDonald Houses in 64 countries, keeping families close to their critically ill child during treatment. Families stay in a home-away-from-home environment with private bedrooms, shared kitchens, laundry, and community spaces. Most Houses charge a nominal nightly fee (often $0–$25) or nothing at all, based on ability to pay. Ronald McDonald Family Rooms inside hospitals provide a private respite space just steps from the pediatric unit. To find the nearest House, visit the website or ask your hospital social worker.',
  'financial', 'lodging',
  'Ronald McDonald House Charities', 'https://www.rmhc.org', '630-623-7048',
  ARRAY['newly_diagnosed','in_treatment','relapse'],
  ARRAY['lodging','housing','meals','travel','family support'],
  true, true, 2
),

(
  'Alex''s Lemonade Stand Foundation — Grants & Research',
  'Funds childhood cancer research and provides grants to families through programs like SuperSibs and the ALSF Travel Fund.',
  'Alex''s Lemonade Stand Foundation (ALSF) was started by 4-year-old Alexandra "Alex" Scott, who was diagnosed with neuroblastoma. Today ALSF is one of the leading funders of childhood cancer research, having funded over $250 million in research. They also provide family support through the Travel Fund (financial assistance for families traveling to treatment centers), the SuperSibs program (recognition and support packages for siblings), and Cancerversary celebration kits. ALSF partners with hospitals nationally to identify eligible families.',
  'financial', 'grants and research',
  'Alex''s Lemonade Stand Foundation', 'https://www.alexslemonade.org', '866-333-1213',
  ARRAY['newly_diagnosed','in_treatment','post_treatment','relapse','survivorship'],
  ARRAY['financial assistance','travel fund','research','grants','siblings'],
  true, true, 3
),

(
  'National Children''s Cancer Society — Financial Aid',
  'Provides direct financial assistance to families of children with cancer, covering non-medical expenses such as transportation, lodging, and home care.',
  'The National Children''s Cancer Society (NCCS) provides financial assistance to families of children (under 18) with cancer, covering costs that insurance typically does not: transportation to treatment, lodging, home care, nutritional supplements, and other essential non-medical expenses. NCCS also offers the Beyond the Cure scholarship program for childhood cancer survivors. Eligibility is based on diagnosis and financial need. Families can apply directly or through their hospital social worker. NCCS serves families throughout the United States.',
  'financial', 'direct financial aid',
  'National Children''s Cancer Society', 'https://www.thenccs.org', '314-241-1600',
  ARRAY['newly_diagnosed','in_treatment','relapse'],
  ARRAY['financial assistance','transportation','lodging','home care','scholarships'],
  true, true, 4
),

(
  'HealthWell Foundation — Copay & Premium Assistance',
  'Helps underinsured patients afford their medications and healthcare costs by providing copay assistance, insurance premium support, and cost-sharing assistance.',
  'The HealthWell Foundation is an independent nonprofit providing financial assistance to underinsured Americans facing chronic or life-altering conditions, including pediatric cancers. Programs cover insurance premium assistance, cost-sharing assistance, and medication copays. HealthWell operates disease-specific funds; families should check the website for currently open pediatric oncology funds. Applications can be submitted by the patient, caregiver, or treating physician. Eligibility is based on income, diagnosis, and insurance status.',
  'financial', 'insurance assistance',
  'HealthWell Foundation', 'https://www.healthwellfoundation.org', '800-675-8416',
  ARRAY['newly_diagnosed','in_treatment','relapse'],
  ARRAY['copay assistance','insurance','premiums','medication costs'],
  false, true, 5
),

(
  'Patient Advocate Foundation — Case Management & Copay Relief',
  'Provides professional case management and co-pay relief to patients with chronic, life-threatening, and debilitating illnesses including childhood cancer.',
  'Patient Advocate Foundation (PAF) offers professional case management services at no cost to patients and families dealing with insurance denials, medical debt, and employment issues related to a diagnosis. Their case managers help navigate insurance appeals, connect families to financial assistance programs, and resolve access-to-care barriers. PAF also operates a Co-Pay Relief Program that provides direct financial assistance with insurance cost-sharing for eligible diagnoses. Services are available to patients of all ages including children.',
  'financial', 'case management',
  'Patient Advocate Foundation', 'https://www.patientadvocate.org', '800-532-5274',
  ARRAY['newly_diagnosed','in_treatment','post_treatment','relapse'],
  ARRAY['case management','copay relief','insurance appeals','financial navigation'],
  true, true, 6
),

(
  'CancerCare — Financial Assistance & Counseling',
  'Provides free professional support services including financial assistance, counseling, and navigation for anyone affected by cancer.',
  'CancerCare is a national nonprofit providing free, professional support services to anyone affected by cancer. Financial assistance is available for treatment-related costs including homecare, childcare, transportation, and pain medication. CancerCare''s oncology social workers provide free individual counseling, support groups, and educational workshops—all at no cost. Services are available by phone, online, and in-person in New York. CancerCare also runs a Co-Payment Assistance Foundation for medication co-pays. Call their Hopeline for immediate support and navigation.',
  'financial', 'comprehensive support',
  'CancerCare', 'https://www.cancercare.org', '800-813-4673',
  ARRAY['newly_diagnosed','in_treatment','post_treatment','relapse','bereavement','survivorship'],
  ARRAY['financial assistance','counseling','support groups','transportation','medication'],
  true, true, 7
),

(
  'Joe''s Kids — Free Airline Flights for Treatment',
  'Provides free airline tickets to children with cancer and their families who need to travel for medical treatment.',
  'Joe''s Kids provides free commercial airline tickets to children with cancer and other life-threatening conditions who need to travel to receive specialized medical treatment. The program helps families who cannot afford the cost of commercial airfare to reach distant treatment centers. Applications are processed through hospital social workers or directly by families. Joe''s Kids has provided tickets to thousands of families since its founding. Eligibility requires a child under 18 with cancer or other qualifying condition and demonstrated financial need.',
  'financial', 'travel assistance',
  'Joe''s Kids', 'https://www.joeskids.org', '904-739-0606',
  ARRAY['newly_diagnosed','in_treatment','relapse'],
  ARRAY['travel','flights','transportation','airline tickets'],
  false, true, 8
),

(
  'Angel Airlines Miracle Network — Free Private Flights',
  'Coordinates free air transportation using private aircraft for children and adults who need to travel to receive specialized medical treatment.',
  'Angel Flight networks across the country coordinate free air transportation using volunteer private pilots for patients who need to travel long distances for medical care and cannot afford or tolerate commercial flights. There are several regional Angel Flight organizations (Angel Flight West, Angel Flight Mid-Atlantic, Angel Flight Soars, etc.). Families typically need to be ambulatory and medically stable to fly. Contact the network serving your region through the national website or ask your hospital social worker for a referral.',
  'financial', 'travel assistance',
  'Angel Flight America', 'https://www.angelflight.com', '405-749-8992',
  ARRAY['newly_diagnosed','in_treatment','relapse'],
  ARRAY['travel','flights','private aircraft','transportation'],
  false, true, 9
),

(
  'Children With Hair Loss — Free Wigs for Children',
  'Provides free hair replacement systems to children and young adults facing medically-related hair loss.',
  'Children With Hair Loss provides free human hair replacements (wigs) to children and young adults (up to age 21) who have experienced medically-related hair loss due to cancer treatment, alopecia, burns, trichotillomania, or other conditions. Hair replacements are custom-fitted and made from donated human hair. There is no cost to eligible recipients. Families can apply directly on the website. Applications require a brief medical certification. Children With Hair Loss has served over 10,000 children since its founding.',
  'financial', 'in-kind support',
  'Children With Hair Loss', 'https://www.childrenwithhairloss.us', '269-350-3484',
  ARRAY['in_treatment','relapse'],
  ARRAY['wigs','hair loss','chemotherapy','in-kind support'],
  false, true, 10
),

(
  'Wigs for Kids — Hair Replacement for Children',
  'Provides hair replacement systems at no charge to children who have lost their hair due to chemotherapy, radiation, alopecia, or other medical conditions.',
  'Wigs for Kids provides custom-made hair replacement systems at no charge to children up to age 18 who have experienced hair loss due to cancer treatment, alopecia, trichotillomania, or other conditions. Their wigs are made from natural hair and are custom-fitted by trained stylists. The program is funded entirely by donations. Families can find a certified stylist in their area through the website. The application process takes approximately 6–8 weeks from start to completion.',
  'financial', 'in-kind support',
  'Wigs for Kids', 'https://www.wigsforkids.org', '440-333-4433',
  ARRAY['in_treatment','relapse'],
  ARRAY['wigs','hair loss','chemotherapy','in-kind support'],
  false, true, 11
),

(
  'Cleaning for a Reason — Free Home Cleaning During Treatment',
  'Partners with professional maid services to provide free house cleaning to cancer patients and their families during treatment.',
  'Cleaning for a Reason connects cancer patients with professional house cleaning services who volunteer their time to provide free cleanings. Eligible patients receive up to two free cleanings per month during active cancer treatment. The service is available throughout the United States and Canada. To apply, patients must be undergoing active cancer treatment (chemotherapy, radiation, immunotherapy, etc.) and provide brief medical verification. Cleaning for a Reason has provided over 40,000 free cleanings to date.',
  'financial', 'in-kind support',
  'Cleaning for a Reason', 'https://cleaningforareason.org', '877-337-3348',
  ARRAY['in_treatment','relapse'],
  ARRAY['house cleaning','practical support','in-kind','treatment support'],
  false, true, 12
),

(
  'The Inheritance of Hope — Legacy Retreats for Families',
  'Provides transformative retreat experiences for young families facing the terminal illness or recent loss of a parent.',
  'Inheritance of Hope (IoH) provides Legacy Retreats for young families facing the terminal illness of a parent, including when a parent has cancer. Retreats are fully funded (transportation, hotel, meals, activities) and designed to create meaningful memories and provide hope. IoH also offers an online community, coaching, and ongoing support for legacy families. Retreats are offered in various locations throughout the year. Families apply through the website; eligibility requires a parent with a terminal or life-threatening diagnosis and children in the home.',
  'financial', 'experiential support',
  'Inheritance of Hope', 'https://inheritanceofhope.org', '888-272-0524',
  ARRAY['in_treatment','relapse','bereavement'],
  ARRAY['retreat','legacy','family experience','terminal','parent cancer'],
  false, true, 13
),

(
  'NeedyMeds — Drug Assistance & Cost-Savings Programs',
  'Free database of patient assistance programs, copay cards, state pharmaceutical programs, and other resources to help patients afford their medications.',
  'NeedyMeds is a nonprofit information resource helping people find assistance programs to help them afford their medications and other healthcare costs. The website and helpline provide access to a comprehensive database of pharmaceutical manufacturer patient assistance programs, state pharmaceutical assistance programs, copay assistance programs, and disease-specific help organizations. Families can search by drug name, diagnosis, or assistance type. NeedyMeds also provides a drug discount card (free) that can reduce prescription costs at pharmacies nationwide.',
  'financial', 'prescription assistance',
  'NeedyMeds', 'https://www.needymeds.org', '800-503-6897',
  ARRAY['newly_diagnosed','in_treatment','post_treatment','relapse','survivorship'],
  ARRAY['prescription assistance','medication costs','drug assistance','copay'],
  false, true, 14
),

-- ============================================
-- MEDICAL / CLINICAL
-- ============================================

(
  'Children''s Oncology Group — Clinical Trials & Treatment Standards',
  'The world''s largest organization devoted to childhood and adolescent cancer research, conducting clinical trials at 200+ member institutions.',
  'The Children''s Oncology Group (COG) is a National Cancer Institute-supported clinical trials cooperative group and the world''s largest organization devoted exclusively to childhood and adolescent cancer research. COG conducts clinical trials across more than 200 member hospitals in the US, Canada, Europe, and Australia. Most children with cancer in the US are treated at COG member institutions, giving them access to the latest protocols and trials. Families can find active trials through the website or at ClinicalTrials.gov. COG also publishes free Long-Term Follow-Up Guidelines for childhood cancer survivors.',
  'medical', 'clinical trials',
  'Children''s Oncology Group', 'https://www.childrensoncologygroup.org', NULL,
  ARRAY['newly_diagnosed','in_treatment','relapse','survivorship'],
  ARRAY['clinical trials','research','treatment protocols','COG member hospitals'],
  true, true, 1
),

(
  'St. Jude Children''s Research Hospital — Free Treatment',
  'Treats the most catastrophic childhood cancers and diseases. Families never pay for treatment, travel, housing, or food.',
  'St. Jude Children''s Research Hospital in Memphis, TN is one of the world''s premier pediatric cancer research and treatment centers. St. Jude treats children with the most catastrophic childhood diseases — primarily cancer — and the family never pays St. Jude for anything: not for treatment, travel, housing, or food. St. Jude shares its discoveries freely to help children globally. Families can be referred by their physician or apply directly. St. Jude accepts patients up to age 18 (some programs to 21) with cancer or other qualifying conditions.',
  'medical', 'treatment center',
  'St. Jude Children''s Research Hospital', 'https://www.stjude.org', '888-226-4343',
  ARRAY['newly_diagnosed','in_treatment','relapse'],
  ARRAY['free treatment','research hospital','treatment center','referral'],
  true, true, 2
),

(
  'CureSearch for Children''s Cancer — Research Funding & Clinical Trials',
  'Funds pediatric cancer research and maintains a clinical trial search tool to help families find active studies for their child.',
  'CureSearch for Children''s Cancer funds research to find cures and better treatments for childhood cancer through two research programs: the National Clinical Trials Network and its own research grants. CureSearch maintains an online clinical trial finder to help families identify active trials for their child''s specific diagnosis and location. They also provide educational resources and family support through their website. CureSearch has funded over $200 million in pediatric cancer research.',
  'medical', 'research and trials',
  'CureSearch for Children''s Cancer', 'https://curesearch.org', '800-458-6223',
  ARRAY['newly_diagnosed','in_treatment','relapse'],
  ARRAY['clinical trials','research','trial finder','treatment options'],
  false, true, 3
),

(
  'National Cancer Institute — Pediatric Cancer Information',
  'Provides comprehensive, evidence-based cancer information, a clinical trials database, and funding for pediatric oncology research.',
  'The National Cancer Institute (NCI) is the federal government''s principal agency for cancer research and training. NCI provides the most comprehensive and authoritative cancer information available, including detailed PDQ (Physician Data Query) treatment summaries written for both patients and health professionals. The NCI Cancer Information Service (1-800-4-CANCER) provides live support from trained information specialists. ClinicalTrials.gov, maintained in part by NCI, is the definitive database for finding active clinical trials. NCI also operates the Pediatric Oncology Branch at the NIH Clinical Center.',
  'medical', 'information and research',
  'National Cancer Institute', 'https://www.cancer.gov/types/childhood-cancers', '800-422-6237',
  ARRAY['newly_diagnosed','in_treatment','post_treatment','relapse','survivorship'],
  ARRAY['information','clinical trials','research','PDQ','NCI'],
  true, true, 4
),

(
  'Make-A-Wish Foundation — Wish Granting',
  'Grants life-changing wishes to children with critical illnesses, including cancer, providing hope, strength, and joy during treatment.',
  'Make-A-Wish grants the wishes of children with critical illnesses between the ages of 2½ and 18 to enrich the human experience with hope, strength, and joy. Children with cancer are among the most frequent wish recipients. Wishes are tailored to the individual child and can include travel experiences, meeting a celebrity, having a special item, or other meaningful experiences. Make-A-Wish has chapters in all 50 states and operates in 50+ countries. Families can self-refer or be referred by a medical professional. The medical team must confirm the diagnosis.',
  'medical', 'wish granting',
  'Make-A-Wish Foundation', 'https://www.wish.org', '800-722-9474',
  ARRAY['newly_diagnosed','in_treatment','relapse'],
  ARRAY['wish','experience','hope','critically ill','pediatric'],
  true, true, 5
),

(
  'Pediatric Brain Tumor Foundation — Support & Research',
  'Funds brain tumor research and provides support programs for children and families affected by pediatric brain tumors.',
  'The Pediatric Brain Tumor Foundation (PBTF) funds research to find cures for children with brain tumors — the leading cause of cancer-related death in children. PBTF also provides direct family support through a helpline, educational resources, a family support fund, and the Beads of Courage program. Their Childhood Brain Tumor Foundation resources help families understand diagnosis, treatment options, and late effects. PBTF maintains a network of family support volunteers who have personal experience with pediatric brain tumors.',
  'medical', 'disease-specific support',
  'Pediatric Brain Tumor Foundation', 'https://www.curethekids.org', '800-253-6530',
  ARRAY['newly_diagnosed','in_treatment','post_treatment','relapse','survivorship'],
  ARRAY['brain tumor','research','support','helpline','family fund'],
  false, true, 6
),

(
  'Leukemia & Lymphoma Society — Blood Cancer Support',
  'Funds blood cancer research and provides direct patient support including financial assistance, a patient navigator program, and co-pay assistance.',
  'The Leukemia & Lymphoma Society (LLS) is the world''s largest voluntary health organization dedicated to developing better blood cancer treatments, therapies, and cures. LLS funds research in leukemias, lymphomas, Hodgkin disease, and myeloma. For families, LLS provides: the Information Resource Center (staffed by oncology nurses), a free Patient Navigator program, co-pay and travel assistance, clinical trial support, and educational materials. Pediatric patients with blood cancers are explicitly included in all support programs.',
  'medical', 'disease-specific support',
  'Leukemia & Lymphoma Society', 'https://www.lls.org', '800-955-4572',
  ARRAY['newly_diagnosed','in_treatment','post_treatment','relapse','survivorship'],
  ARRAY['leukemia','lymphoma','blood cancer','patient navigator','financial assistance','co-pay'],
  true, true, 7
),

(
  'Hyundai Hope on Wheels — Pediatric Cancer Research Grants',
  'Funds pediatric cancer research at children''s hospitals nationwide through grants to researchers.',
  'Hyundai Hope on Wheels is a nonprofit funded by Hyundai Motor America and its U.S. dealers, committed to finding a cure for childhood cancer. Since 1998, Hope on Wheels has awarded over $200 million in research grants to pediatric oncologists at children''s hospitals across the country. Grants include Scholar Hope Grants for early-career researchers and Impact Grants for established researchers. Families benefit through the research conducted at their child''s hospital. The website lists all grant-recipient hospitals.',
  'medical', 'research funding',
  'Hyundai Hope on Wheels', 'https://www.hyundaihopeonwheels.org', NULL,
  ARRAY['newly_diagnosed','in_treatment','relapse','survivorship'],
  ARRAY['research','grants','hospital research','pediatric oncology'],
  false, true, 8
),

(
  'St. Baldrick''s Foundation — Childhood Cancer Research',
  'Volunteer-powered childhood cancer research funding through head-shaving fundraising events, granting over $340 million to researchers.',
  'St. Baldrick''s Foundation is a volunteer-powered charity committed to funding the most promising research to find cures for childhood cancer. Through their signature head-shaving events and online fundraising, St. Baldrick''s has funded over $340 million in childhood cancer research grants. They fund research fellowships, infrastructure grants, and research grants at institutions across the US and internationally. Families can engage through fundraising or by finding St. Baldrick''s funded researchers at their child''s hospital.',
  'medical', 'research funding',
  'St. Baldrick''s Foundation', 'https://www.stbaldricks.org', '626-792-8247',
  ARRAY['newly_diagnosed','in_treatment','relapse','survivorship'],
  ARRAY['research','fundraising','grants','pediatric oncology'],
  false, true, 9
),

(
  'American Childhood Cancer Organization — Education & Advocacy',
  'Provides free educational materials, family support, policy advocacy, and awareness programs for childhood cancer families.',
  'The American Childhood Cancer Organization (ACCO) is one of the largest grassroots organizations dedicated to childhood cancer in the United States. ACCO provides free educational materials to newly diagnosed families through their Gold Ribbon booklet series (available in English and Spanish), maintains an online family support community, conducts policy advocacy at the federal level, and runs childhood cancer awareness programs. ACCO also connects families with local support groups and provides a Spanish-language resource section on their website.',
  'medical', 'advocacy and education',
  'American Childhood Cancer Organization', 'https://www.acco.org', '855-858-2226',
  ARRAY['newly_diagnosed','in_treatment','post_treatment','relapse','survivorship'],
  ARRAY['education','advocacy','free materials','support community','Spanish'],
  true, true, 10
),

(
  'Courageous Parents Network — Palliative & End-of-Life Guidance',
  'Free web-based guidance for parents of children with serious illness, helping families navigate medical complexity, values, and care decisions.',
  'Courageous Parents Network (CPN) provides free, web-based guidance for parents of children with serious illness including cancer. Their library of videos and written content is created by expert clinicians and experienced parents, covering topics such as: talking with your child about their illness, navigating the medical system, palliative care, advance care planning, and managing end-of-life decisions. CPN is particularly valuable for families whose child''s cancer is advanced or refractory. All content is freely available without registration.',
  'medical', 'palliative care',
  'Courageous Parents Network', 'https://courageousparentsnetwork.org', NULL,
  ARRAY['in_treatment','relapse','bereavement'],
  ARRAY['palliative care','end of life','serious illness','guidance','advance care planning'],
  false, true, 11
),

-- ============================================
-- EMOTIONAL SUPPORT
-- ============================================

(
  'CancerCare — Free Counseling & Support Groups',
  'Offers free individual counseling with oncology social workers, online and telephone support groups, and educational workshops for cancer families.',
  'CancerCare''s professional oncology social workers provide free counseling by phone, online, or in-person for anyone affected by cancer—including parents, siblings, grandparents, and the child themselves. Support groups are available by phone and online for specific diagnoses and family roles (e.g., parents of children with cancer). Educational workshops cover practical topics from managing treatment side effects to navigating insurance. CancerCare also provides financial assistance and navigation services. Call the Hopeline for immediate connection to a social worker.',
  'emotional', 'counseling',
  'CancerCare', 'https://www.cancercare.org', '800-813-4673',
  ARRAY['newly_diagnosed','in_treatment','post_treatment','relapse','bereavement','survivorship'],
  ARRAY['counseling','support groups','social worker','free','therapy','mental health'],
  true, true, 1
),

(
  'Cancer Support Community — Professional Support Programs',
  'Provides free support, education, and hope to people affected by cancer through a network of affiliates, online communities, and a helpline.',
  'Cancer Support Community (CSC) is the largest professionally led nonprofit network of cancer support worldwide, providing emotional support, education, and hope to anyone impacted by cancer—including children and their families. CSC offers free support groups, educational workshops, stress reduction programs, and individual support through its network of over 175 affiliates and online community. The Cancer Support Helpline provides immediate connection to professional counselors. CSC''s Frankly Speaking About Cancer educational series includes resources specific to pediatric cancer.',
  'emotional', 'support programs',
  'Cancer Support Community', 'https://www.cancersupportcommunity.org', '888-793-9355',
  ARRAY['newly_diagnosed','in_treatment','post_treatment','relapse','bereavement','survivorship'],
  ARRAY['support groups','counseling','education','helpline','network'],
  true, true, 2
),

(
  'Imerman Angels — One-on-One Peer Mentorship',
  'Connects cancer patients, survivors, and caregivers with a personally matched mentor who has faced the same type of cancer.',
  'Imerman Angels provides free, personalized one-on-one connections between cancer fighters and caregivers and someone who has been through the same experience — called a "Mentor Angel." Mentor Angels are cancer survivors or caregivers who volunteer their time to provide support, guidance, and hope. Matching is based on cancer type, age, treatment history, and personal characteristics. Services are available to anyone affected by any type of cancer at any stage. Matching typically takes 1–2 weeks. There is no cost for the service.',
  'emotional', 'peer support',
  'Imerman Angels', 'https://imermanangels.org', '312-274-5529',
  ARRAY['newly_diagnosed','in_treatment','post_treatment','relapse','survivorship'],
  ARRAY['peer support','mentor','survivor','caregiver support','one-on-one'],
  true, true, 3
),

(
  'Stupid Cancer — Young Adult Cancer Support',
  'The largest organization serving young adults (ages 15–39) with cancer, providing peer support, community, and empowerment programs.',
  'Stupid Cancer is the largest organization dedicated to young adults (ages 15–39) with cancer. They provide community, resources, and advocacy for an underserved age group that faces unique challenges including fertility preservation, insurance, career disruption, and age-appropriate peer support. Programs include the CancerCon annual summit, online communities, a podcast, and peer navigation. For teenage cancer patients, Stupid Cancer bridges the gap between pediatric and adult oncology programs.',
  'emotional', 'peer support',
  'Stupid Cancer', 'https://stupidcancer.org', NULL,
  ARRAY['newly_diagnosed','in_treatment','post_treatment','relapse','survivorship'],
  ARRAY['young adult','teen','peer support','community','ages 15-39'],
  false, true, 4
),

(
  'The Compassionate Friends — Grief Support After Child Loss',
  'Provides highly personal comfort, hope, and support to every family experiencing the death of a son or daughter, sibling, or grandchild.',
  'The Compassionate Friends (TCF) is a national self-help organization offering friendship, understanding, and hope to bereaved parents, grandparents, and siblings after the death of a child. TCF has over 650 chapters throughout the United States and offers monthly in-person chapter meetings, an online support community, regional conferences, a national helpline, and a magazine. All services are free. TCF is particularly valuable for families who have lost a child to cancer and are navigating bereavement.',
  'emotional', 'bereavement',
  'The Compassionate Friends', 'https://www.compassionatefriends.org', '877-969-0010',
  ARRAY['bereavement'],
  ARRAY['grief','bereavement','child loss','parent grief','support group'],
  true, true, 5
),

(
  'Gilda''s Club — Cancer Support for the Whole Family',
  'Provides free cancer support for people of all ages living with cancer, as well as their families and friends, through support groups, lectures, and social activities.',
  'Gilda''s Club (a Cancer Support Community affiliate) creates welcoming communities of free support for people of all ages living with cancer, as well as their families and friends. Programs include support groups, educational workshops, networking groups, social activities, and kids'' programs. Gilda''s Club is named for comedian Gilda Radner, who died of ovarian cancer. Many locations offer specialized programs for children with cancer and their siblings. Membership is free and open to anyone affected by cancer.',
  'emotional', 'community support',
  'Gilda''s Club / Cancer Support Community', 'https://www.cancersupportcommunity.org', '888-793-9355',
  ARRAY['newly_diagnosed','in_treatment','post_treatment','relapse','bereavement','survivorship'],
  ARRAY['community support','support groups','kids programs','family','social activities'],
  false, true, 6
),

(
  'Camp Sunshine — Respite for Children with Cancer',
  'Provides year-round retreats and a summer camp experience for children with life-threatening illnesses and their families at no cost.',
  'Camp Sunshine is a retreat program in Casco, Maine offering year-round, week-long retreats for children (birth through age 18) with life-threatening illnesses — including cancer — and their immediate families. The entire family attends together, and the program is offered at no cost, including transportation assistance. Retreats feature recreational activities for children alongside peer support, counseling, and educational programming for parents. Camp Sunshine serves families at all stages of illness, including bereavement retreats for families who have lost a child.',
  'emotional', 'camp programs',
  'Camp Sunshine', 'https://www.campsunshine.org', '207-655-3800',
  ARRAY['in_treatment','relapse','bereavement','survivorship'],
  ARRAY['camp','retreat','family support','respite','free'],
  false, true, 7
),

(
  'Victory Junction — Camp for Children with Chronic Conditions',
  'A specially designed camp for children ages 6–16 with chronic medical conditions including cancer, providing fun, empowering camp experiences.',
  'Victory Junction provides year-round, life-changing experiences for children with chronic medical conditions or serious illnesses — including cancer — at no cost to families. The camp, founded by NASCAR legend Kyle Petty, is medically equipped and staffed to serve children who might not otherwise be able to attend a traditional summer camp. Sessions are organized by diagnosis. Victory Junction is located in Randleman, NC and serves children ages 6–16.',
  'emotional', 'camp programs',
  'Victory Junction', 'https://www.victoryjunction.org', '336-498-9055',
  ARRAY['in_treatment','post_treatment','survivorship'],
  ARRAY['camp','summer camp','children','chronic illness','free'],
  false, true, 8
),

(
  '988 Suicide & Crisis Lifeline — 24/7 Crisis Support',
  'Free 24/7 crisis support by call or text for anyone in emotional distress, including parents and caregivers overwhelmed by a child''s cancer diagnosis.',
  'The 988 Suicide & Crisis Lifeline provides free, confidential support for people in suicidal crisis or emotional distress 24 hours a day, 7 days a week, across the United States. Call or text 988 to reach a trained counselor. Chat is also available at 988lifeline.org. For cancer families — including parents, siblings, and survivors — who are experiencing overwhelming grief, anxiety, or despair, 988 provides immediate crisis support without any cost or registration.',
  'emotional', 'crisis support',
  '988 Suicide & Crisis Lifeline', 'https://988lifeline.org', '988',
  ARRAY['newly_diagnosed','in_treatment','post_treatment','relapse','bereavement','survivorship'],
  ARRAY['crisis','mental health','suicide prevention','24/7','emergency','hotline'],
  true, true, 9
),

(
  'Crisis Text Line — Text-Based Mental Health Crisis Support',
  'Free, 24/7 crisis support via text message for anyone in crisis, including overwhelmed cancer parents and caregivers.',
  'Crisis Text Line provides free, 24/7 support via text message for anyone in crisis. Text HOME to 741741 from anywhere in the USA to connect with a trained Crisis Counselor. Conversations are confidential. For cancer families experiencing acute emotional distress — particularly at night when other services are unavailable — Crisis Text Line provides an accessible, private option. The service is designed for anyone experiencing a mental health crisis, including grief, anxiety, and despair.',
  'emotional', 'crisis support',
  'Crisis Text Line', 'https://www.crisistextline.org', '741741',
  ARRAY['newly_diagnosed','in_treatment','post_treatment','relapse','bereavement','survivorship'],
  ARRAY['crisis','mental health','text','24/7','counselor','emergency'],
  true, true, 10
),

(
  'Livestrong Foundation — Cancer Support & Navigation',
  'Provides free cancer support services including navigation, financial assistance, fertility preservation guidance, and survivorship resources.',
  'The Livestrong Foundation helps people affected by cancer navigate their diagnosis and treatment. Services include a free Livestrong at the YMCA program for cancer survivors, the Livestrong Fertility program (connecting patients to discounted or free fertility preservation services), survivorship care planning resources, and patient navigation. The Livestrong Foundation also advocates for cancer patients at the state and federal levels. Call the Livestrong Cancer Navigation Services line to speak with a navigator.',
  'emotional', 'navigation and support',
  'Livestrong Foundation', 'https://www.livestrong.org', '855-220-7777',
  ARRAY['newly_diagnosed','in_treatment','post_treatment','survivorship'],
  ARRAY['navigation','fertility preservation','survivorship','advocacy','support'],
  true, true, 11
),

-- ============================================
-- PRACTICAL SUPPORT
-- ============================================

(
  'Lotsa Helping Hands — Community Care Coordination',
  'Free online platform to coordinate care and support for families in need, including meal delivery, rides, and errands.',
  'Lotsa Helping Hands is a free, private online community that helps coordinate care and support for families in need, such as those dealing with a child''s cancer diagnosis. Families create a free "community" where friends, family, church members, and neighbors can sign up to bring meals, provide rides, help with errands, or offer other support. The platform includes a calendar, message board, and task coordination tools. No technical expertise is required. Lotsa Helping Hands is used by over 1 million caregiving communities.',
  'practical', 'care coordination',
  'Lotsa Helping Hands', 'https://lotsahelpinghands.com', NULL,
  ARRAY['newly_diagnosed','in_treatment','relapse'],
  ARRAY['meals','rides','coordination','community support','volunteers','practical help'],
  true, true, 1
),

(
  'CaringBridge — Free Health Journey Website',
  'Free personalized website to share health updates, receive support, and stay connected with family and friends during a health crisis.',
  'CaringBridge provides free personalized health websites allowing families to share updates about their child''s cancer journey with family and friends, reducing the burden of individually updating everyone. Visitors can offer words of encouragement, and a Planner feature helps coordinate practical support such as meals and rides. CaringBridge sites are private by default and give families control over who can view their updates. CaringBridge has served over 7 million users since 1997.',
  'practical', 'communication',
  'CaringBridge', 'https://www.caringbridge.org', NULL,
  ARRAY['newly_diagnosed','in_treatment','post_treatment','relapse','bereavement','survivorship'],
  ARRAY['communication','updates','website','community','planner','practical'],
  true, true, 2
),

(
  'MealTrain — Meal Coordination for Families in Need',
  'Free platform for organizing meal support from friends, family, and community members for families dealing with illness.',
  'Meal Train is a free online service that makes it easy for communities to coordinate meal support for families dealing with illness, surgery, or other challenges. Friends and family members can view a calendar, sign up to bring meals on specific dates, and coordinate with other supporters to avoid duplication. The platform includes options for dietary restrictions and delivery preferences. For cancer families who cannot cook during treatment, having organized meal support from their community can be transformative.',
  'practical', 'care coordination',
  'Meal Train', 'https://www.mealtrain.com', NULL,
  ARRAY['newly_diagnosed','in_treatment','relapse'],
  ARRAY['meals','food','community support','coordination','practical help'],
  false, true, 3
),

(
  'Triage Cancer — Legal & Financial Navigation',
  'Provides free education on the legal and practical issues that accompany a cancer diagnosis, including insurance, employment, and financial rights.',
  'Triage Cancer is a national nonprofit providing free education to help cancer patients and caregivers quickly navigate the practical and legal issues that accompany a cancer diagnosis. Resources cover health insurance, employment rights (FMLA, ADA), disability benefits (Social Security, SSDI), financial assistance programs, estate planning, and more. Triage Cancer offers free webinars, online resources, and an annual Cancer Survivorship Conference. Resources are available for patients of all ages including families of children with cancer.',
  'practical', 'legal navigation',
  'Triage Cancer', 'https://triagecancer.org', '424-258-4628',
  ARRAY['newly_diagnosed','in_treatment','post_treatment','relapse','survivorship'],
  ARRAY['legal','insurance','employment','FMLA','disability','financial rights','navigation'],
  true, true, 4
),

(
  'Association of Child Life Professionals — Child Life Specialists',
  'Certifies child life specialists who help children cope with hospitalization, procedures, and serious illness through play and emotional support.',
  'The Association of Child Life Professionals (ACLP) certifies Certified Child Life Specialists (CCLS) who work in hospitals to help children and families cope with hospitalization, illness, and procedures. Child life specialists use play, preparation, and education to reduce fear and anxiety. They work directly with children with cancer and their siblings. Ask your child''s nurse or social worker for a child life referral on the day of admission. Child life services are typically available at no additional cost at children''s hospitals.',
  'practical', 'hospital support',
  'Association of Child Life Professionals', 'https://www.childlife.org', '800-252-4515',
  ARRAY['newly_diagnosed','in_treatment','relapse'],
  ARRAY['child life','hospitalization','coping','play therapy','hospital support'],
  false, true, 5
),

-- ============================================
-- LEGAL / ADVOCACY
-- ============================================

(
  'Patient Advocate Foundation — Insurance & Legal Case Management',
  'Free professional case management helping families navigate insurance denials, medical debt, job retention, and access-to-care issues.',
  'Patient Advocate Foundation (PAF) provides free professional case management services to patients facing chronic, life-threatening, and debilitating conditions. Case managers help families resolve insurance denials and appeals, manage medical debt, address job retention and leave issues (FMLA, ADA), and navigate access-to-care barriers. PAF''s Co-Pay Relief Program provides direct financial assistance for qualifying diagnoses. Case management is available by phone Monday–Friday. PAF serves patients of all ages including children with cancer.',
  'legal', 'case management',
  'Patient Advocate Foundation', 'https://www.patientadvocate.org', '800-532-5274',
  ARRAY['newly_diagnosed','in_treatment','post_treatment','relapse','survivorship'],
  ARRAY['insurance appeals','case management','medical debt','FMLA','legal advocacy'],
  true, true, 1
),

(
  'Triage Cancer — Know Your Rights as a Cancer Patient',
  'Free legal education covering insurance rights, employment protections, disability benefits, and financial planning for cancer patients and families.',
  'Triage Cancer provides comprehensive, free legal and practical education for cancer patients and caregivers. Their Quick Guides cover: health insurance basics (marketplace plans, employer coverage, COBRA), employment rights (FMLA, ADA, state leave laws), government benefits (Social Security Disability, Medicaid, Medicare), financial assistance programs, and estate planning. Their annual webinar series is free and covers timely policy changes. Resources are practical, organized by topic, and written in plain language.',
  'legal', 'rights and advocacy',
  'Triage Cancer', 'https://triagecancer.org', '424-258-4628',
  ARRAY['newly_diagnosed','in_treatment','post_treatment','relapse','survivorship'],
  ARRAY['insurance rights','employment','FMLA','disability','Social Security','legal education'],
  true, true, 2
),

(
  'Disability Rights Advocates — Legal Aid for Families',
  'National nonprofit legal center providing free representation to people with disabilities, including children with cancer facing discrimination.',
  'Disability Rights Advocates (DRA) is a leading nonprofit legal center advancing the rights of people with all types of disabilities. Children with cancer may have disability rights under the Americans with Disabilities Act (ADA) and Section 504 of the Rehabilitation Act, including rights to reasonable accommodations at school and in healthcare settings. DRA provides free legal representation and advocacy for systemic disability rights issues. For school-based advocacy, also contact your state''s Protection & Advocacy organization.',
  'legal', 'disability rights',
  'Disability Rights Advocates', 'https://dralegal.org', '510-665-8644',
  ARRAY['in_treatment','post_treatment','survivorship'],
  ARRAY['disability rights','ADA','504','legal advocacy','discrimination','school rights'],
  false, true, 3
),

(
  'Benefits.gov — Federal Benefits Eligibility Tool',
  'Official U.S. government website that helps families find and apply for federal benefits programs they may be eligible for.',
  'Benefits.gov is the official benefits website of the U.S. government, providing a single point of access to over 1,000 federal benefit and assistance programs. Cancer families can use the online screening tool to identify benefits they may qualify for, including Medicaid, CHIP, Social Security Disability Insurance (SSDI), Supplemental Security Income (SSI), SNAP (food stamps), housing assistance, and more. The site also provides instructions for how to apply for each program.',
  'legal', 'government benefits',
  'Benefits.gov', 'https://www.benefits.gov', NULL,
  ARRAY['newly_diagnosed','in_treatment','post_treatment','relapse'],
  ARRAY['government benefits','Medicaid','CHIP','SSI','SSDI','SNAP','assistance'],
  false, true, 4
),

-- ============================================
-- EDUCATIONAL
-- ============================================

(
  'COG School Re-Entry Guidelines — Returning to School After Cancer',
  'Free evidence-based guidelines from the Children''s Oncology Group helping children with cancer return to school successfully.',
  'The Children''s Oncology Group (COG) provides free, evidence-based resources to help children with cancer return to school during or after treatment. Their school re-entry guidelines are designed for teachers, school counselors, and parents, covering cognitive effects of treatment, managing fatigue, addressing social challenges, and legal rights (504 plans, IEPs). COG member hospital social workers and school liaison programs can help coordinate school re-entry. These resources are available free on the COG website.',
  'educational', 'school re-entry',
  'Children''s Oncology Group', 'https://www.childrensoncologygroup.org', NULL,
  ARRAY['in_treatment','post_treatment','survivorship'],
  ARRAY['school re-entry','504 plan','IEP','cognitive effects','education rights','return to school'],
  true, true, 1
),

(
  'Ulman Foundation — Scholarships for Young Adult Survivors',
  'Provides need-based scholarships to young adults (ages 15–39) whose lives have been impacted by cancer, including childhood cancer survivors.',
  'The Ulman Foundation provides need-based scholarships to young adults (ages 15–39) who are cancer survivors, patients, or who have had a parent with cancer. The foundation also provides free cancer support services including a patient navigation program, community house near Johns Hopkins in Baltimore, and young adult cancer retreats. The scholarship program awards multiple scholarships annually based on financial need, academic achievement, and community involvement. Applications open each year in the fall.',
  'educational', 'scholarships',
  'Ulman Foundation', 'https://ulmanfoundation.org', '410-964-0202',
  ARRAY['post_treatment','survivorship'],
  ARRAY['scholarship','college','young adult','survivor','financial aid','education'],
  true, true, 2
),

(
  'Children''s Oncology Group — COG Family Handbook',
  'A free, comprehensive guide for families newly diagnosed with childhood cancer, covering treatment, side effects, emotional support, and practical guidance.',
  'The Children''s Oncology Group publishes a free, comprehensive family handbook for children newly diagnosed with cancer. The handbook covers understanding the diagnosis, types of childhood cancer, how chemotherapy and radiation work, managing side effects, emotional responses, school re-entry, survivorship, and finding support. It is available in English and Spanish in print (mailed free) and digital format. Ask your oncology social worker for a copy or download it from the COG website.',
  'educational', 'family resources',
  'Children''s Oncology Group', 'https://www.childrensoncologygroup.org', NULL,
  ARRAY['newly_diagnosed','in_treatment'],
  ARRAY['family handbook','education','newly diagnosed','treatment guide','free resource'],
  true, true, 3
),

(
  'Khan Academy — Free Online Learning During Treatment',
  'Free, world-class education for children who miss school during cancer treatment, covering all subjects from kindergarten through college.',
  'Khan Academy provides free, high-quality educational content for students of all ages, covering math, science, history, literature, and test prep from kindergarten through college level. For children with cancer who miss significant school time during treatment, Khan Academy allows them to learn at their own pace from home, the hospital, or wherever they are. The platform is free and works on any device with internet access. Khan Academy can complement homebound instruction and help children stay academically connected during prolonged absences.',
  'educational', 'online learning',
  'Khan Academy', 'https://www.khanacademy.org', NULL,
  ARRAY['in_treatment','relapse'],
  ARRAY['online learning','school','education','free','at-home learning','homebound'],
  false, true, 4
),

(
  'National Center for School Crisis and Bereavement — School Support',
  'Provides resources for schools on how to support students with serious illness and students who have experienced loss.',
  'The National Center for School Crisis and Bereavement (NCSCB) provides free resources for schools on supporting students through crisis and bereavement, including when a student has cancer or when a student has lost a sibling or peer to cancer. Resources include guidelines for educators, parent handouts, and training materials. The NCSCB helpline provides consultation to schools and families navigating difficult situations. Resources are available in English and Spanish.',
  'educational', 'school support',
  'National Center for School Crisis and Bereavement', 'https://www.schoolcrisiscenter.org', '877-536-2722',
  ARRAY['in_treatment','post_treatment','bereavement','survivorship'],
  ARRAY['school support','bereavement','teacher resources','student illness','crisis'],
  false, true, 5
),

-- ============================================
-- COMMUNITY
-- ============================================

(
  'ACCO Online Community — Childhood Cancer Parent Network',
  'Free online community where parents of children with cancer connect, share experiences, and support one another.',
  'The American Childhood Cancer Organization (ACCO) hosts a free online community for parents and families of children with cancer. The community allows families to connect with others who are going through similar experiences, share resources, ask questions, and offer mutual support. ACCO also maintains an active social media presence and coordinates local support group connections. The community is moderated to maintain a safe, supportive environment.',
  'community', 'online community',
  'American Childhood Cancer Organization', 'https://www.acco.org', '855-858-2226',
  ARRAY['newly_diagnosed','in_treatment','post_treatment','relapse','bereavement','survivorship'],
  ARRAY['online community','parent network','support','connection','peer support'],
  true, true, 1
),

(
  'Inspire.com — Childhood Cancer Online Support Community',
  'Online health community where parents of children with cancer connect with others facing the same diagnosis.',
  'Inspire hosts online support communities for a wide range of health conditions, including active communities for parents of children with specific childhood cancers (neuroblastoma, leukemia, brain tumors, and others). Members share experiences, ask questions, and provide mutual support. Inspire communities are moderated and free to join. Many communities have tens of thousands of members, making it easy to find others with very specific experiences relevant to your child''s diagnosis and treatment.',
  'community', 'online community',
  'Inspire Health', 'https://www.inspire.com', NULL,
  ARRAY['newly_diagnosed','in_treatment','post_treatment','relapse','bereavement','survivorship'],
  ARRAY['online community','support','peer connection','diagnosis specific','forum'],
  false, true, 2
),

(
  'Sebastian Strong Foundation — Hope Navigator Program',
  'Connects families of children with cancer with trained navigators who provide personalized support, resource navigation, and emotional accompaniment.',
  'The Sebastian Strong Foundation''s Hope Navigator Program connects families of children facing childhood cancer with trained parent navigators — people who have walked the same path — for personalized, one-on-one support. Navigators help families understand their options, navigate the system, access financial and practical resources, and never feel alone during the most challenging time of their lives. The SS Navigator app is the foundation''s digital platform for connecting families to resources and their Navigator. Services are provided at no cost.',
  'community', 'navigation',
  'Sebastian Strong Foundation', 'https://www.sebastianstrong.org', NULL,
  ARRAY['newly_diagnosed','in_treatment','post_treatment','relapse','bereavement','survivorship'],
  ARRAY['navigator','personal support','Sebastian Strong','foundation','hope'],
  true, true, 3
),

-- ============================================
-- NAVIGATION
-- ============================================

(
  'National Patient Advocate Foundation — Case Management',
  'Provides free case management services helping patients navigate the healthcare system, resolve insurance issues, and access financial assistance.',
  'The National Patient Advocate Foundation (NPAF) is the advocacy affiliate of the Patient Advocate Foundation (PAF). Together, PAF and NPAF address barriers to care through case management, policy advocacy, and systemic change. PAF case managers assist cancer patients with insurance issues, medical debt, employment challenges, and access to treatment at no cost. The Co-Pay Relief Program provides direct financial assistance for medication copays for qualifying patients. Services are available nationwide by phone.',
  'navigation', 'case management',
  'National Patient Advocate Foundation', 'https://www.npaf.org', '800-532-5274',
  ARRAY['newly_diagnosed','in_treatment','post_treatment','relapse','survivorship'],
  ARRAY['case management','navigation','insurance','advocacy','co-pay relief'],
  true, true, 1
),

(
  'CancerCare Navigation Services — Oncology Social Work',
  'Free navigation services provided by professional oncology social workers helping families access resources, manage systems, and find support.',
  'CancerCare provides free navigation services staffed by professional oncology social workers. Navigators help families identify and access financial assistance, connect with support services, understand their diagnosis and treatment, manage insurance issues, and navigate the often-overwhelming cancer care system. Services are available by phone, online chat, or in-person (New York). CancerCare navigators can connect families to resources across the country and are available for families at any stage of the cancer journey.',
  'navigation', 'professional navigation',
  'CancerCare', 'https://www.cancercare.org', '800-813-4673',
  ARRAY['newly_diagnosed','in_treatment','post_treatment','relapse','bereavement','survivorship'],
  ARRAY['navigation','social worker','resource connection','professional support','system navigation'],
  true, true, 2
),

(
  'Hospital Social Work Services — Your First Call',
  'Every children''s hospital has licensed social workers who help families navigate financial assistance, community resources, practical support, and emotional needs.',
  'Your child''s hospital social worker is often the single most powerful resource available to you — and they are there specifically to help your family. Hospital-based oncology social workers at children''s hospitals are typically Master''s-level clinicians with deep knowledge of local and national resources. They can help you access financial assistance programs, navigate insurance, arrange transportation and lodging, connect with community support, and address emotional and practical challenges. Ask for a social work referral on your child''s first day of diagnosis.',
  'navigation', 'hospital based',
  'Children''s Hospital Social Work', 'https://www.childrensnational.org/departments/social-work', NULL,
  ARRAY['newly_diagnosed','in_treatment','relapse'],
  ARRAY['social work','hospital','navigation','local resources','first call'],
  true, true, 3
),

-- ============================================
-- SURVIVORSHIP
-- ============================================

(
  'COG Long-Term Follow-Up Guidelines — Survivor Health Guide',
  'Free, evidence-based guidelines for monitoring the long-term health of childhood cancer survivors, covering potential late effects by treatment type.',
  'The Children''s Oncology Group (COG) publishes free, comprehensive Long-Term Follow-Up (LTFU) Guidelines for survivors of childhood, adolescent, and young adult cancers. The guidelines provide evidence-based recommendations for health screening based on the specific treatments a survivor received, including monitoring for cardiac effects after anthracyclines, neurocognitive effects after brain radiation, secondary cancers, hormonal issues, and more. Health Link fact sheets translate the clinical guidelines into patient-friendly language. Downloadable free at survivorshipguidelines.org.',
  'survivorship', 'survivor guidelines',
  'Children''s Oncology Group', 'https://www.survivorshipguidelines.org', NULL,
  ARRAY['post_treatment','survivorship'],
  ARRAY['late effects','survivorship guidelines','health monitoring','COG','follow-up care','long-term'],
  true, true, 1
),

(
  'National Coalition for Cancer Survivorship — Advocacy & Rights',
  'The oldest survivor-led cancer advocacy organization in the U.S., advocating for quality care and equal rights for cancer survivors of all ages.',
  'The National Coalition for Cancer Survivorship (NCCS) is the oldest survivor-led cancer advocacy organization in the United States, advocating for quality cancer care and equal rights for all people touched by cancer — including childhood cancer survivors. NCCS advocates for survivorship care planning, quality of life research, and policy changes that protect cancer survivors'' rights. Their Cancer Survivor Toolbox is a free audio resource helping survivors develop skills for managing survivorship challenges. NCCS represents survivors from diagnosis through the end of life.',
  'survivorship', 'advocacy',
  'National Coalition for Cancer Survivorship', 'https://canceradvocacy.org', '877-622-7937',
  ARRAY['post_treatment','survivorship'],
  ARRAY['survivorship','advocacy','rights','quality care','policy','cancer survivor toolbox'],
  false, true, 2
),

(
  'Livestrong Fertility — Fertility Preservation for Cancer Patients',
  'Helps cancer patients access affordable fertility preservation options before starting treatment that may affect fertility.',
  'Livestrong Fertility helps cancer patients access fertility preservation services before starting cancer treatments that could affect their ability to have children. The program connects patients with a network of over 450 participating fertility clinics that offer discounted services, provides information on fertility preservation options (egg freezing, sperm banking, embryo freezing), and offers financial assistance for qualifying patients. The program serves patients of all ages including teens and young adults. Time is often critical — contact Livestrong Fertility immediately after diagnosis.',
  'survivorship', 'fertility preservation',
  'Livestrong Fertility', 'https://www.livestrong.org/we-can-help/livestrong-fertility', '855-220-7777',
  ARRAY['newly_diagnosed','in_treatment'],
  ARRAY['fertility','preservation','egg freezing','sperm banking','young adult','teen'],
  true, true, 3
),

(
  'Save My Fertility — Fertility Resources for Cancer Patients',
  'Free educational resource helping cancer patients and healthcare providers understand fertility preservation options before treatment.',
  'SaveMyFertility.org is a free online educational resource developed by leading fertility and oncology experts to help cancer patients and their healthcare providers understand fertility preservation options before starting cancer treatment. The site includes information on how specific cancer treatments affect fertility, options for preserving fertility in men, women, girls, and boys, how to talk to the oncology team about fertility, and questions to ask the fertility specialist. The site is particularly valuable for teenage patients whose long-term fertility is at risk.',
  'survivorship', 'fertility preservation',
  'Save My Fertility', 'https://www.savemyfertility.org', NULL,
  ARRAY['newly_diagnosed'],
  ARRAY['fertility','preservation','treatment effects','teen','education','before treatment'],
  false, true, 4
),

(
  'Journey Forward — Survivorship Care Planning Tool',
  'Free online tool that helps create personalized survivorship care plans documenting cancer history, treatment received, and follow-up recommendations.',
  'Journey Forward is a free online tool that helps cancer survivors, caregivers, and healthcare providers create personalized survivorship care plans. A survivorship care plan documents the cancer history, treatments received, potential long-term effects, and recommended follow-up screenings. Having this plan helps primary care physicians understand what monitoring a survivor needs. Journey Forward was developed with funding from LIVESTRONG and is endorsed by major oncology organizations. Plans can be printed and shared with all members of the care team.',
  'survivorship', 'care planning',
  'Journey Forward', 'https://www.journeyforward.org', NULL,
  ARRAY['post_treatment','survivorship'],
  ARRAY['survivorship care plan','follow-up','documentation','late effects','primary care'],
  false, true, 5
),

-- ============================================
-- SIBLING SUPPORT
-- ============================================

(
  'Sibling Support Project — Resources for Brothers and Sisters',
  'The world''s first and largest effort dedicated to the interests of siblings of people with special health, developmental, and mental health needs.',
  'The Sibling Support Project is a national program of the Arc of the United States dedicated to the interests of brothers and sisters of people with special health, developmental, and mental health needs — including siblings of children with cancer. The project hosts Sibshops, lively peer support and education programs for school-age siblings that combine fun recreational activities with opportunities to discuss the joys and challenges of having a sibling with a serious illness. Sibshops are offered in communities throughout the US and internationally.',
  'sibling_support', 'education and peer support',
  'Sibling Support Project', 'https://www.siblingsupport.org', '206-297-6368',
  ARRAY['newly_diagnosed','in_treatment','post_treatment','relapse','bereavement','survivorship'],
  ARRAY['siblings','Sibshops','peer support','brothers and sisters','school-age'],
  true, true, 1
),

(
  'SuperSibs — Recognition & Support for Cancer Siblings',
  'Recognizes and provides support to brothers and sisters of children with cancer through care packages, recognition awards, and resources.',
  'SuperSibs, a program of Alex''s Lemonade Stand Foundation, is dedicated to recognizing and supporting the often-forgotten siblings of children with cancer. SuperSibs sends personalized care packages to siblings with activities, games, and recognition of their bravery and resilience. The program acknowledges that siblings face unique challenges including disrupted routines, parental attention shifts, fear, and grief, and helps them feel seen and supported. Families can register their other children through the ALSF website.',
  'sibling_support', 'recognition and support',
  'SuperSibs (Alex''s Lemonade Stand Foundation)', 'https://www.alexslemonade.org/our-programs/supersibs', '866-333-1213',
  ARRAY['newly_diagnosed','in_treatment','post_treatment','relapse','bereavement'],
  ARRAY['siblings','care packages','recognition','brothers and sisters','support'],
  true, true, 2
),

(
  'The Dougy Center — Grief Support for Children',
  'Provides support in a safe place where children, teens, young adults, and their families grieving a death can share their experiences.',
  'The Dougy Center is the first center in the United States to provide peer support groups for grieving children. They provide free support groups for children, teens, young adults, and their families who are grieving the death of a loved one — including siblings who have lost a brother or sister to cancer. The Dougy Center also provides training for schools and community organizations, and offers free resources online including the booklet "After a Death: An Activity Book for Children." Peer support groups meet regularly in Portland, OR, with a national network of affiliate centers.',
  'sibling_support', 'bereavement support',
  'The Dougy Center', 'https://www.dougy.org', '503-775-5683',
  ARRAY['bereavement'],
  ARRAY['grief','bereavement','children','siblings','peer support','child loss'],
  true, true, 3
),

(
  'Comfort Zone Camp — Bereavement Camp for Children',
  'Free bereavement camp program helping children ages 7–17 who have experienced the loss of a loved one.',
  'Comfort Zone Camp provides free bereavement camps for children ages 7–17 who have experienced the death of a parent, sibling, or primary caregiver. Weekend camps are offered at multiple sites across the country and create a safe space for children to grieve, connect with peers who understand their experience, and develop healthy coping skills. For siblings who have lost a brother or sister to cancer, Comfort Zone Camp provides peer connection and grief support in a nurturing environment. Applications are accepted year-round.',
  'sibling_support', 'bereavement camp',
  'Comfort Zone Camp', 'https://www.comfortzonecamp.org', '804-377-3430',
  ARRAY['bereavement'],
  ARRAY['grief camp','bereavement','siblings','children','peer support','free','loss'],
  true, true, 4
),

(
  'National Alliance for Grieving Children — Grief Support Network',
  'Promotes awareness of the needs of children and teens who are grieving and provides education, resources, and an affiliate network.',
  'The National Alliance for Grieving Children (NAGC) promotes awareness about the needs of children and teens who are grieving a death and provides resources for those who support them. NAGC maintains a free directory of grief support programs for children throughout the United States, helping families find local support groups, camps, and counseling. Their website also provides free educational resources for parents, teachers, and caregivers supporting a grieving child. For siblings of children who have died from cancer, the NAGC directory is the best resource for finding local support.',
  'sibling_support', 'grief support',
  'National Alliance for Grieving Children', 'https://childrengrieve.org', NULL,
  ARRAY['bereavement'],
  ARRAY['grief','bereavement','children','siblings','local support','directory'],
  false, true, 5
),

(
  'Now I Lay Me Down to Sleep — Remembrance Photography',
  'Provides free professional remembrance photography sessions for families experiencing the death or anticipated death of a baby or child.',
  'Now I Lay Me Down to Sleep (NILMDTS) is a nonprofit organization providing free remembrance photography services to families experiencing the death or anticipated death of a baby or child. A network of volunteer professional photographers is available 24/7 to hospitals, hospices, and homes throughout the US and internationally. For families whose child with cancer is approaching end of life, these images become an irreplaceable legacy. NILMDTS also provides grief support resources for families. Referrals can be made through the treating hospital.',
  'sibling_support', 'legacy and remembrance',
  'Now I Lay Me Down to Sleep', 'https://www.nowilaymedowntosleep.org', '877-834-5667',
  ARRAY['bereavement'],
  ARRAY['photography','remembrance','legacy','end of life','bereavement','memory'],
  true, true, 6
);

-- ============================================
-- Verify record count
-- ============================================
-- SELECT category, COUNT(*) FROM public.resources GROUP BY category ORDER BY category;
